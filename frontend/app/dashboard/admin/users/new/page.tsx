import DashboardLayout from "@/components/DashboardLayout";
import UserForm from "@/components/UserForm";
import { createUser } from "../actions";

export default function NewUserPage() {
  return (
    <DashboardLayout role="admin" title="Add user" subtitle="Create an account and choose its role">
      <UserForm action={createUser} submitLabel="Create user" />
    </DashboardLayout>
  );
}