import { notFound } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import UserForm from "@/components/UserForm";
import { fetchManagedUser } from "@/lib/usersApi";
import { updateUser } from "../../actions";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await fetchManagedUser(id);
  if (!user) notFound();

  return (
    <DashboardLayout role="admin" title="Edit user" subtitle={`${user.name} (${user.username})`}>
      <UserForm action={updateUser.bind(null, user.id)} user={user} submitLabel="Save changes" />
    </DashboardLayout>
  );
}