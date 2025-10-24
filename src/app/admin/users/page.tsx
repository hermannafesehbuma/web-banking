'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supbaseClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/simple-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, CheckCircle, XCircle, Clock, Eye, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string;
  full_name: string;
  kyc_status: string;
  created_at: string;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, users]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_users')
        .select('id, email, full_name, kyc_status, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users.',
          variant: 'destructive',
        });
      } else {
        setUsers(data || []);
        setFilteredUsers(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => user.kyc_status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleApproveKYC = async (userId: string, userName: string) => {
    try {
      console.log('🎯 APPROVING KYC FOR USER:', userId, userName);

      // Get user email
      const { data: userData } = await supabase
        .from('bank_users')
        .select('email')
        .eq('id', userId)
        .single();

      console.log('📧 User email:', userData?.email);

      // Update bank_users.kyc_status
      console.log('🔄 Updating bank_users.kyc_status to approved...');
      const { error } = await supabase
        .from('bank_users')
        .update({ kyc_status: 'approved' })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error approving KYC in bank_users:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to approve KYC.',
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ bank_users.kyc_status updated to approved');

      // ALSO update kyc_submissions.status to approved
      console.log('🔄 Updating kyc_submissions.status to approved...');
      const { data: kycUpdate, error: kycError } = await supabase
        .from('kyc_submissions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select();

      if (kycError) {
        console.error('❌ Error updating kyc_submissions:', kycError);
      } else {
        console.log(
          '✅ kyc_submissions.status updated to approved:',
          kycUpdate
        );
      }

      // Create checking and savings accounts for the user
      console.log('🏦 Creating checking and savings accounts...');

      // Check if accounts already exist
      const { data: existingAccounts } = await supabase
        .from('accounts')
        .select('id, account_type')
        .eq('user_id', userId);

      console.log('📊 Existing accounts:', existingAccounts);

      if (!existingAccounts || existingAccounts.length < 2) {
        // Create checking account
        const checkingNumber = Math.floor(Math.random() * 10000000000)
          .toString()
          .padStart(10, '0');
        const { data: checkingAccount, error: checkingError } = await supabase
          .from('accounts')
          .insert({
            user_id: userId,
            account_type: 'checking',
            account_number: checkingNumber,
            balance: 0,
          })
          .select()
          .single();

        if (checkingError) {
          console.error('❌ Error creating checking account:', checkingError);
        } else {
          console.log('✅ Checking account created:', checkingAccount);
        }

        // Create savings account
        const savingsNumber = Math.floor(Math.random() * 10000000000)
          .toString()
          .padStart(10, '0');
        const { data: savingsAccount, error: savingsError } = await supabase
          .from('accounts')
          .insert({
            user_id: userId,
            account_type: 'savings',
            account_number: savingsNumber,
            balance: 0,
          })
          .select()
          .single();

        if (savingsError) {
          console.error('❌ Error creating savings account:', savingsError);
        } else {
          console.log('✅ Savings account created:', savingsAccount);
        }

        console.log('🎉 Account creation completed!');
      } else {
        console.log('✅ User already has accounts, skipping creation');
      }

      // Continue with the rest of the flow
      {
        // Create alert for user
        await supabase.from('alerts').insert({
          user_id: userId,
          title: 'KYC Approved! 🎉',
          message:
            'Your KYC verification has been approved. You now have full access to all features.',
          type: 'success',
          is_read: false,
        });

        // Send email notification
        if (userData?.email) {
          try {
            await fetch('/api/emails/kyc-approved', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: userData.email,
                userName: userName,
              }),
            });
          } catch (emailError) {
            console.error('Failed to send email:', emailError);
          }
        }

        toast({
          title: 'KYC Approved',
          description: `${userName}'s KYC has been approved and notified.`,
        });
        await loadUsers();
      }
    } catch (err) {
      console.error('Approve KYC error:', err);
      toast({
        title: 'Error',
        description: 'Failed to approve KYC.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectKYC = async (userId: string, userName: string) => {
    try {
      // Get user email
      const { data: userData } = await supabase
        .from('bank_users')
        .select('email')
        .eq('id', userId)
        .single();

      const { error } = await supabase
        .from('bank_users')
        .update({ kyc_status: 'rejected' })
        .eq('id', userId);

      if (error) {
        console.error('Error rejecting KYC:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to reject KYC.',
          variant: 'destructive',
        });
      } else {
        // Send email notification
        if (userData?.email) {
          try {
            await fetch('/api/emails/kyc-rejected', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: userData.email,
                userName: userName,
              }),
            });
          } catch (emailError) {
            console.error('Failed to send email:', emailError);
          }
        }

        toast({
          title: 'KYC Rejected',
          description: `${userName}'s KYC has been rejected and notified.`,
        });
        await loadUsers();
      }
    } catch (err) {
      console.error('Reject KYC error:', err);
      toast({
        title: 'Error',
        description: 'Failed to reject KYC.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);

    try {
      // Delete user from bank_users (CASCADE will delete related records)
      const { error } = await supabase
        .from('bank_users')
        .delete()
        .eq('id', deleteConfirm.id);

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete user.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'User deleted',
          description: `${
            deleteConfirm.full_name || deleteConfirm.email
          } has been removed from the system.`,
        });

        setDeleteConfirm(null);
        await loadUsers();
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete user.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground mt-1">
          View and manage all registered users
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Showing {filteredUsers.length} of {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-sm">Name</th>
                  <th className="pb-3 font-medium text-sm">Email</th>
                  <th className="pb-3 font-medium text-sm">KYC Status</th>
                  <th className="pb-3 font-medium text-sm">Joined</th>
                  <th className="pb-3 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-4">
                        <p className="font-medium">{user.full_name || 'N/A'}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </td>
                      <td className="py-4">
                        {getStatusBadge(user.kyc_status)}
                      </td>
                      <td className="py-4">
                        <p className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2 flex-wrap">
                          {user.kyc_status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleApproveKYC(
                                    user.id,
                                    user.full_name || user.email
                                  )
                                }
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleRejectKYC(
                                    user.id,
                                    user.full_name || user.email
                                  )
                                }
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/users/${user.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(user)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <p className="text-muted-foreground">No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Delete User</CardTitle>
              <CardDescription>This action cannot be undone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                <p className="text-sm text-red-900 dark:text-red-100">
                  <strong>Warning:</strong> Deleting this user will permanently
                  remove:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 mt-2 ml-4 list-disc">
                  <li>User account and profile</li>
                  <li>All associated accounts (checking, savings)</li>
                  <li>Transaction history</li>
                  <li>KYC documents</li>
                  <li>Cards and alerts</li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-1">User to delete:</p>
                <p className="text-sm">{deleteConfirm.full_name || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">
                  {deleteConfirm.email}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteUser}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete User'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
