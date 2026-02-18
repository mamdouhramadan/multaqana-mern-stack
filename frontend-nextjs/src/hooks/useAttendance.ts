import { useMemo } from 'react';
import { useGetData, type QueryParams } from './useGetData';

/**
 * ==============================================
 * Attendance Types - أنواع بيانات الحضور
 * ==============================================
 */

/**
 * حالة الحضور - Attendance Status
 * present: حاضر | late: متأخر | absent: غائب | leave: إجازة | holiday: عطلة رسمية | weekend: عطلة نهاية الأسبوع | mission: مهمة خارجية
 */
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave' | 'holiday' | 'weekend' | 'mission';

/**
 * سجل الحضور - Attendance Record
 */
export interface AttendanceRecord {
  id: string;
  date: string;        // التاريخ (DD/MM/YYYY) - Date in DD/MM/YYYY format
  day: string;         // اسم اليوم - Day name (e.g., "Thursday")
  status: AttendanceStatus;  // حالة الحضور - Attendance status
  checkIn?: string;    // وقت الدخول - Check-in time
  checkOut?: string;   // وقت الخروج - Check-out time
  workingHours?: string | null; // ساعات العمل - Working hours
  notes?: string;      // ملاحظات - Notes
}

/** Raw shape from Node API (MongoDB Attendance model). */
interface AttendanceRecordRaw {
  _id?: string;
  date?: string;
  clockIn?: string;
  clockOut?: string;
  status?: string;
  workHours?: number;
  note?: string;
  [key: string]: unknown;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const STATUS_MAP: Record<string, AttendanceStatus> = {
  Present: 'present',
  Late: 'late',
  Absent: 'absent',
  Leave: 'leave',
  PublicHoliday: 'holiday',
  Weekend: 'weekend',
};

function formatDateOnly(isoOrDate: string | undefined): string {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '';
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTime(isoOrDate: string | undefined): string {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '';
  return d.toTimeString().slice(0, 5);
}

function workHoursToString(value: number | undefined): string | null {
  if (value == null || value < 0) return null;
  const totalMinutes = value >= 24 ? Math.round(value) : Math.round(value * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
}

function normalizeAttendanceRecord(raw: AttendanceRecordRaw): AttendanceRecord {
  const dateStr = formatDateOnly(raw.date);
  const dateObj = raw.date ? new Date(raw.date) : null;
  const dayName = dateObj && !Number.isNaN(dateObj.getTime())
    ? DAY_NAMES[dateObj.getDay()]
    : '';

  const statusKey = raw.status ?? 'Absent';
  const status: AttendanceStatus = STATUS_MAP[statusKey] ?? 'absent';

  return {
    id: raw._id ?? '',
    date: dateStr,
    day: dayName,
    status,
    checkIn: formatTime(raw.clockIn) || undefined,
    checkOut: formatTime(raw.clockOut) || undefined,
    workingHours: workHoursToString(raw.workHours) ?? undefined,
    notes: raw.note ?? undefined,
  };
}

/**
 * إحصائيات الحضور - Attendance Statistics
 */
export interface AttendanceStats {
  totalDays: number;           // إجمالي الأيام - Total days in period
  workingDays: number;         // أيام العمل - Working days (excluding weekends/holidays)
  presentDays: number;         // أيام الحضور - Present days
  lateDays: number;            // أيام التأخير - Late days
  absentDays: number;          // أيام الغياب - Absent days
  leaveDays: number;           // أيام الإجازة - Leave days
  missionDays: number;         // أيام المهمات - Mission days
  holidayDays: number;         // أيام العطل الرسمية - Holiday days
  weekendDays: number;         // أيام نهاية الأسبوع - Weekend days
  attendanceRate: number;      // نسبة الحضور (%) - Attendance rate percentage
  totalWorkingHours: string;   // إجمالي ساعات العمل - Total working hours
}

/**
 * ==============================================
 * useAttendance Hook - هوك الحضور
 * ==============================================
 * 
 * A hook for fetching attendance data and calculating statistics
 * هوك لجلب بيانات الحضور وحساب الإحصائيات
 * 
 * @param params - Optional query parameters for filtering
 *                 معلمات اختيارية للتصفية
 * 
 * @returns Object containing attendance data, stats, loading state, and error
 *          كائن يحتوي على بيانات الحضور والإحصائيات وحالة التحميل والأخطاء
 * 
 * @example
 * // جلب بيانات الحضور مع الإحصائيات
 * // Fetch attendance data with statistics
 * const { records, stats, isLoading, error } = useAttendance();
 * 
 * @example
 * // تصفية حسب الحالة
 * // Filter by status
 * const { records } = useAttendance({ status: 'late' });
 */
export function useAttendance(params?: QueryParams) {
  // جلب البيانات من الخادم - Fetch data from server (Node API returns raw shape)
  const { data: rawData, isLoading, error, refetch } = useGetData<AttendanceRecordRaw[]>('attendance', params);

  // Normalize backend records to frontend AttendanceRecord shape
  const records = useMemo<AttendanceRecord[]>(
    () => (rawData ?? []).map(normalizeAttendanceRecord),
    [rawData]
  );

  /**
   * حساب الإحصائيات من بيانات الحضور
   * Calculate statistics from attendance data
   */
  const stats = useMemo<AttendanceStats | null>(() => {
    if (!records.length) return null;

    // عداد الحالات - Status counters
    let presentDays = 0;
    let lateDays = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let missionDays = 0;
    let holidayDays = 0;
    let weekendDays = 0;
    let totalMinutes = 0;

    // حساب كل حالة - Count each status
    records.forEach((record) => {
      switch (record.status) {
        case 'present':
          presentDays++;
          break;
        case 'late':
          lateDays++;
          break;
        case 'absent':
          absentDays++;
          break;
        case 'leave':
          leaveDays++;
          break;
        case 'mission':
          missionDays++;
          break;
        case 'holiday':
          holidayDays++;
          break;
        case 'weekend':
          weekendDays++;
          break;
      }

      // حساب ساعات العمل - Calculate working hours
      if (record.workingHours) {
        const [hours, minutes] = record.workingHours.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          totalMinutes += hours * 60 + minutes;
        }
      }
    });

    // حساب إجمالي الأيام وأيام العمل
    // Calculate total days and working days
    const totalDays = records.length;
    const workingDays = totalDays - weekendDays - holidayDays;

    // حساب نسبة الحضور (الحضور + التأخير + المهمات) / أيام العمل
    // Calculate attendance rate: (present + late + mission) / working days
    const effectiveAttendance = presentDays + lateDays + missionDays;
    const attendanceDenominator = workingDays - leaveDays; // Exclude leave from calculation
    const attendanceRate = attendanceDenominator > 0
      ? Math.round((effectiveAttendance / attendanceDenominator) * 100)
      : 0;

    // تحويل الدقائق إلى ساعات:دقائق - Convert minutes to hours:minutes
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const totalWorkingHours = `${totalHours}:${remainingMinutes.toString().padStart(2, '0')}`;

    return {
      totalDays,
      workingDays,
      presentDays,
      lateDays,
      absentDays,
      leaveDays,
      missionDays,
      holidayDays,
      weekendDays,
      attendanceRate,
      totalWorkingHours,
    };
  }, [records]);

  /**
   * تصفية السجلات حسب الحالة
   * Filter records by status
   */
  const filterByStatus = useMemo(() => {
    if (!records.length) return {};

    return {
      present: records.filter((r) => r.status === 'present'),
      late: records.filter((r) => r.status === 'late'),
      absent: records.filter((r) => r.status === 'absent'),
      leave: records.filter((r) => r.status === 'leave'),
      mission: records.filter((r) => r.status === 'mission'),
    };
  }, [records]);

  return {
    // البيانات الخام - Raw data (normalized from Node API)
    records,

    // الإحصائيات المحسوبة - Calculated statistics
    stats,

    // السجلات مصنفة حسب الحالة - Records grouped by status
    filterByStatus,

    // حالات React Query
    isLoading,
    error,
    refetch,
  };
}

export default useAttendance;
