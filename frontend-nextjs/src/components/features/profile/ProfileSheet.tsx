import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { GradientWrapper } from "@/components/ui/GradientWrapper";
import { getCurrentUser, type CurrentUserProfile } from "@/api/userService";
import {
  User,
  EnvelopeSimple,
  IdentificationCard,
  Briefcase,
  ArrowRight,
  CalendarBlank,
} from "@phosphor-icons/react";
import { Spinner } from "@/components/ui/Spinner";
import { getImageUrl } from "@/utils/utils";

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSheet = ({ isOpen, onClose }: ProfileSheetProps) => {
  const { data: currentUser, isLoading, error } = useQuery({
    queryKey: ["users", "me"],
    queryFn: getCurrentUser,
    enabled: isOpen,
  });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center min-h-[200px]">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div className="p-6 text-center text-red-600 dark:text-red-400">
            <p>Failed to load profile. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && currentUser && (
          <ProfileContent user={currentUser} onClose={onClose} />
        )}
      </SheetContent>
    </Sheet>
  );
};

function ProfileContent({ user, onClose: _onClose }: { user: CurrentUserProfile; onClose: () => void }) {
  const imageUrl = user.image ? getImageUrl(user.image) : null;

  return (
    <>
      <GradientWrapper className="p-8">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-[#fff] flex items-center gap-2 text-xl">
            <User weight="duotone" className="text-primary-200" />
            Profile
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-white dark:bg-gray-800 p-1 shadow-xl mb-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-primary-50 flex items-center justify-center text-primary-300">
                <User size={64} weight="fill" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-center text-[#fff] leading-tight mb-1">
            {user.username}
          </h2>
          <div className="mt-4 flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">
            <EnvelopeSimple color="#fff" size={16} />
            <span className="text-xs text-[#fff]/70">{user.email}</span>
          </div>
        </div>
      </GradientWrapper>

      <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-800/50 min-h-[calc(100vh-320px)]">
        {/* Employment / Account Info */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
            <Briefcase size={18} className="text-primary-600" />
            Account & Employment
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {user.employeeCode && (
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1">
                  <IdentificationCard size={12} /> Employee Code
                </p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                  {user.employeeCode}
                </p>
              </div>
            )}
            {user.jobTitle && (
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Job Title</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                  {user.jobTitle}
                </p>
              </div>
            )}
            {user.contractType && (
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Contract</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{user.contractType}</p>
              </div>
            )}
            {user.joiningDate && (
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-1">
                  <CalendarBlank size={12} /> Joining Date
                </p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {new Date(user.joiningDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          {!user.employeeCode && !user.jobTitle && !user.contractType && !user.joiningDate && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No employment details set.</p>
          )}
        </div>

        {/* Contact */}
        {(user.phoneNumber || user.personalEmail) && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4 border-b pb-2">
              Contact
            </h3>
            <div className="space-y-2">
              {user.phoneNumber && (
                <p className="text-gray-800 dark:text-gray-200">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Phone:</span>{" "}
                  {user.phoneNumber}
                </p>
              )}
              {user.personalEmail && (
                <p className="text-gray-800 dark:text-gray-200">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Personal email:</span>{" "}
                  {user.personalEmail}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Attendance link (data comes from separate attendance API) */}
        <div className="flex justify-center">
          <a
            href="/attendance"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
          >
            View Full Attendance
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </>
  );
}
