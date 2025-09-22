import { SidebarProvider, SidebarInset } from "../components/ui/sidebar"
import SidebarTienda from "./SidebarTienda"

export default function LayoutDashboard({ children }) {
  return (
    <SidebarProvider>
      <SidebarTienda />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
