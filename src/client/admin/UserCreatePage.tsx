import UserPropertiesEdit from "@/client/components/edit/UserPropertiesEdit"

export default function UserCreatePage() {

    return (
        <div className="info-page">
            <h1 style={{ textAlign: 'center' }}>User Permissions Management</h1>
            <UserPropertiesEdit />
        </div>
    )
}