import {
  faGauge, faBullhorn, faChartLine, faInbox, faRobot,
} from '@fortawesome/free-solid-svg-icons'
import React, { PropsWithChildren } from 'react'
import { Badge } from 'react-bootstrap'
import SidebarNavItem from '@/components/Layout/Dashboard/Sidebar/SidebarNavItem'
import { getDictionary } from '@/locales/dictionary'

const SidebarNavTitle = (props: PropsWithChildren) => {
  const { children } = props

  return (
    <li className="nav-title px-3 py-2 mt-3 text-uppercase fw-bold">{children}</li>
  )
}

export default async function SidebarNav() {
  const dict = await getDictionary()
  
  return (
    <ul className="list-unstyled">
      <SidebarNavItem icon={faGauge} href="/">
        {dict.sidebar.items.dashboard}
      </SidebarNavItem>

      <SidebarNavItem icon={faInbox} href="/unified-inbox">
        Unified Inbox
      </SidebarNavItem>

      <SidebarNavItem icon={faBullhorn} href="/marketing">
        Marketing
      </SidebarNavItem>

      <SidebarNavItem icon={faRobot} href="/automation">
        Automation
      </SidebarNavItem>

      <SidebarNavItem icon={faChartLine} href="/analytics">
        Analytics
      </SidebarNavItem>
    </ul>
  )
}