import React from 'react'

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="">
            <h1>Admin Dashboard</h1>
            {children}
        </div>
    )
}

export default AdminDashboardLayout