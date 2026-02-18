import { useState, useMemo } from 'react';
import PageLayout from "@/layout/PageLayout";
import { useGetData } from "@/hooks/useGetData";
import { StateRenderer } from "@/components/ui/StateRenderer";
import { EnvelopeSimple, Phone, MagnifyingGlass, Funnel } from "@phosphor-icons/react";
import { EmployeeListSkeleton } from "@/components/skeleton/EmployeeListSkeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getImageUrl } from "@/utils/utils";

interface Employee {
  id: number;
  image: string;
  name: string;
  jobTitle?: string;
  alt?: string;
  department?: string;
  status?: string;
}

const EmployeeList = () => {
  const { data, isLoading, error } = useGetData<Employee[]>('employees');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo((): string[] => {
    if (!data) return ["All"];
    const deps = new Set(data.map(e => e.department).filter((d): d is string => Boolean(d)));
    return ["All", ...Array.from(deps)];
  }, [data]);

  const filteredData = data?.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || employee.department === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <PageLayout isFullPage={false} hasPageTitle={true} hasBreadcrumb={true}>
      <div className="flex flex-col lg:flex-row gap-8">

        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">

          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <Input
                placeholder="Search employees..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100 font-semibold border-b border-gray-100 dark:border-gray-700 pb-2">
              <Funnel size={18} className="text-primary-600" />
              <h6>Departments</h6>
            </div>

            <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value={category} id={`cat-${category}`} />
                  <Label htmlFor={`cat-${category}`} className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">{category}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </aside>

        <div className="flex-1">
          <StateRenderer
            isLoading={isLoading}
            loadingComponent={<EmployeeListSkeleton />}
            error={error?.message ?? null}
            data={filteredData}
            isEmpty={filteredData && filteredData.length === 0}
          >
            {(employees) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
                    <div className="relative mb-4">
                      <img
                        src={getImageUrl(employee.image)}
                        alt={employee.alt || employee.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 dark:border-gray-700"
                      />
                      <span className={`absolute bottom-1 right-1 w-5 h-5 border-2 border-white dark:border-gray-800 rounded-full ${employee.status === 'Online' ? 'bg-green-500' :
                        employee.status === 'Busy' ? 'bg-red-500' : 'bg-gray-400'
                        }`} title={employee.status || 'Offline'}></span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center">{employee.name}</h3>
                    <p className="text-sm font-medium text-primary-600 mb-1 text-center h-10 line-clamp-2">{employee.jobTitle}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">{employee.department} Department</p>

                    <div className="flex gap-2 w-full mt-auto">
                      <button className="flex-1 flex items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-colors">
                        <EnvelopeSimple size={20} />
                      </button>
                      <button className="flex-1 flex items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-colors">
                        <Phone size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </StateRenderer>
        </div>
      </div>
    </PageLayout>
  );
};

export default EmployeeList;
