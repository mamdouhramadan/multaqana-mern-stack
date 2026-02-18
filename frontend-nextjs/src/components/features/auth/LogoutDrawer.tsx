import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface LogoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const LogoutDrawer = ({ isOpen, onClose, onLogout }: LogoutDrawerProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-gray-900 dark:text-white">Log out</DrawerTitle>
            <DrawerDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to sign out?
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 flex flex-col gap-2">
            <Button
              onClick={onLogout}
              className="w-full bg-primary hover:bg-primary/90 dark:bg-primary-600 dark:hover:bg-primary-700 text-primary-foreground"
            >
              Yes, Log out
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full border-gray-200 dark:border-gray-600 bg-transparent dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Cancel
              </Button>
            </DrawerClose>
          </div>
          <DrawerFooter />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
