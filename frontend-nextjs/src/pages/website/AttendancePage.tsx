import { useState, useMemo } from "react";
import PageLayout from "@/layout/PageLayout";
import { useAttendance, type AttendanceStatus } from "@/hooks/useAttendance";
import { StateRenderer } from "@/components/ui/StateRenderer";
import {
  CheckCircle,
  XCircle,
  Clock,
  CalendarX,
  Briefcase,
  Coffee,
  Funnel,
  CalendarBlank,
  Export
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STATUS_CONFIG: Record<AttendanceStatus, { icon: any; color: string; bg: string; label: string }> = {
  present: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Present" },
  late: { icon: Clock, color: "text-orange-600", bg: "bg-orange-50", label: "Late" },
  absent: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Absent" },
  leave: { icon: CalendarX, color: "text-blue-600", bg: "bg-blue-50", label: "Leave" },
  holiday: { icon: Coffee, color: "text-purple-600", bg: "bg-purple-50", label: "Holiday" },
  weekend: { icon: Coffee, color: "text-gray-400", bg: "bg-gray-50", label: "Weekend" },
  mission: { icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50", label: "Mission" },
};

const AttendancePage = () => {
  const { records, stats, isLoading, error } = useAttendance();
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredData = useMemo(() => {
    if (!records) return [];
    return records.filter(record => {
      if (statusFilter !== "all" && record.status !== statusFilter) return false;
      return true;
    });
  }, [records, statusFilter]);

  const TableSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />
      ))}
    </div>
  );

  return (
    <PageLayout isFullPage={false} hasPageTitle={true} hasBreadcrumb={true}>
      <div className="space-y-8">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Days Present</p>
            <p className="text-2xl font-bold text-green-600">{stats?.presentDays ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Late Arrivals</p>
            <p className="text-2xl font-bold text-orange-600">{stats?.lateDays ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Absences</p>
            <p className="text-2xl font-bold text-red-600">{stats?.absentDays ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Leaves</p>
            <p className="text-2xl font-bold text-blue-600">{stats?.leaveDays ?? 0}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px]">
                <CalendarBlank className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {["January", "February", "March", "April", "May", "June"].map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <Funnel className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="leave">On Leave</SelectItem>
                <SelectItem value="mission">Mission</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="gap-2 w-full md:w-auto">
            <Export size={16} />
            Export CSV
          </Button>
        </div>

        <StateRenderer
          isLoading={isLoading}
          loadingComponent={<TableSkeleton />}
          error={error?.message ?? null}
          data={filteredData}
          isEmpty={filteredData.length === 0}
        >
          {(records) => (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 tracking-wider">
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Day</th>
                      <th className="p-4 font-semibold">Check In</th>
                      <th className="p-4 font-semibold">Check Out</th>
                      <th className="p-4 font-semibold">Working Hours</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {records.map((record) => {
                      const statusStyle = STATUS_CONFIG[record.status];
                      const StatusIcon = statusStyle.icon;
                      const isWeekendOrHoliday = record.status === 'weekend' || record.status === 'holiday';

                      return (
                        <tr key={record.id} className={`hover:bg-gray-50/50 transition-colors ${isWeekendOrHoliday ? 'bg-gray-50/30' : ''}`}>
                          <td className="p-4 text-sm font-medium text-gray-900">{record.date}</td>
                          <td className="p-4 text-sm text-gray-600">{record.day}</td>
                          <td className="p-4 text-sm font-semibold text-gray-900">{record.checkIn || '--:--'}</td>
                          <td className="p-4 text-sm font-semibold text-gray-900">{record.checkOut || '--:--'}</td>
                          <td className="p-4 text-sm text-gray-600">{record.workingHours || '-'}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.color} ${statusStyle.bg}`}>
                              <StatusIcon weight="fill" size={14} />
                              {statusStyle.label}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-500 italic">{record.notes}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </StateRenderer>
      </div>
    </PageLayout>
  );
};

export default AttendancePage;
