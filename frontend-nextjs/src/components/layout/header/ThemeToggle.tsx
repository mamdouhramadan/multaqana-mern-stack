import { Moon, Sun, Monitor } from "@phosphor-icons/react";
import { useThemeStore, type ThemeMode } from "@/store/useThemeStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export const ThemeToggle = () => {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const currentOption = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[2];
  const CurrentIcon = currentOption.Icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-gray-800 dark:hover:text-primary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
        aria-label="Theme options"
      >
        <CurrentIcon size={24} weight="duotone" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as ThemeMode)}>
          {OPTIONS.map(({ value, label, Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <span className="flex items-center gap-2">
                <Icon size={18} weight="duotone" aria-hidden />
                {label}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
