import { useAuth } from '@/features/auth'
import { clientRoutes } from '@/lib/routes'
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import React from 'react'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  // const { accessToken } = useAuth()
  // const navigate = useNavigate()
  // console.log(accessToken)
  // if (!accessToken) {
  //   navigate({ from: clientRoutes.dashboard, to: clientRoutes.login })
  // }
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  )
}
