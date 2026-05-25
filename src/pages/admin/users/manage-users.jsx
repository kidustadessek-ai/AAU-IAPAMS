'use client';

import * as React from 'react';
import { FiPlus, FiEdit2 } from 'react-icons/fi';
import { dayjs } from '/src/lib/dayjs';
import { DataTable } from '/src/components/data-table/data-table';
import { DeleteConfirmationPasswordPopover } from '/src/components/dialog/delete-dialog-pass-popup';
import PageLoader from '/src/components/loaders/PageLoader';
import { deleteUserAsync, getUsers } from './_lib/user.actions';
import { defaultUser } from './_lib/user.types';
import { ManageUserDialog } from './manage-user-dialog';
import { RefreshPlugin } from '../../../components/core/plugins/RefreshPlugin';
import { useAuth } from '../../../context/authContext';
import { toast } from 'sonner';

export default function Users({ searchParams }) {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [modalData, setModalData] = React.useState(null);
  const [pagination, setPagination] = React.useState({ pageNo: 1, limit: 10 });
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [status, setStatus] = React.useState('');

  const { auth } = useAuth();

  const ROLE_STYLE = {
    admin: { label: 'Admin', bg: '#fdf0f0', color: '#7B1113' },
    staff: { label: 'Staff', bg: '#eff6ff', color: '#1e40af' },
    evaluator: { label: 'Evaluator', bg: '#f0fdf4', color: '#15803d' },
  };

  const STATUS_STYLE = {
    active: { label: 'Active', bg: '#f0fdf4', color: '#15803d' },
    inactive: { label: 'Inactive', bg: '#fef2f2', color: '#dc2626' },
  };

  async function fetchList() {
    try {
      setLoading(true);
      const response = await getUsers(
        {
          page: pagination.pageNo,
          rowsPerPage: pagination.limit,
          status: status,
        },
        auth?.tokens?.accessToken
      );
      if (response.success) {
        setUsers(response.data);
        setTotalRecords(response.totalRecords);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (data) => {
    setOpenModal(true);
    setModalData(data);
  };

  const handleConfirm = () => {
    setOpenModal(false);
    fetchList();
  };

  const handleDelete = async (password) => {
    try {
      const idsToDelete = [];
      selectedRows.forEach((row) => {
        idsToDelete.push(row._id);
      });
      const response = await deleteUserAsync(idsToDelete, password, auth?.tokens?.accessToken);
      if (response.success) {
        toast.success(`${idsToDelete.length} user(s) deleted successfully`);
        fetchList();
      } else {
        toast.error(response.error?.message || 'Failed to delete users');
      }
    } catch (error) {
      toast.error(error.message);
      console.error('Error deleting users:', error);
    }
  };

  React.useEffect(() => {
    fetchList();
  }, [pagination, status]);

  const columns = [
    {
      formatter: (row) => (
        <button
          onClick={() => handleOpenModal(row)}
          style={{
            padding: '6px', borderRadius: 6, border: 'none',
            background: '#eff6ff', color: '#1e40af',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}
        >
          <FiEdit2 size={14} />
        </button>
      ),
      name: 'Actions',
      align: 'right',
    },
    {
      formatter: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {row.profilePhoto ? (
              <img
                src={row.profilePhoto}
                alt={row.fullName}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: '#7B1113',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: '#fff',
              }}>
                {row.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.3 }}>
                {row.fullName}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                {row.email || 'No email'}
              </p>
            </div>
          </div>
        </div>
      ),
      name: 'Name',
    },
    {
      formatter: (row) => (
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {row.contact_number || '—'}
        </span>
      ),
      name: 'Phone',
    },
    {
      formatter: (row) => {
        const roleStyle = ROLE_STYLE[row.role] || { label: row.role, bg: '#f1f5f9', color: '#475569' };
        return (
          <span style={{
            fontSize: '0.68rem', fontWeight: 600, padding: '4px 10px',
            borderRadius: 6, background: roleStyle.bg, color: roleStyle.color,
            textTransform: 'capitalize',
          }}>
            {roleStyle.label}
          </span>
        );
      },
      name: 'Role',
    },
    {
      formatter(row) {
        return (
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {dayjs(row.createdAt).format('MMM D, YYYY h:mm A')}
          </span>
        );
      },
      name: 'Created at',
    },
    {
      formatter: (row) => {
        const statusStyle = STATUS_STYLE[row.status] || { label: row.status, bg: '#f1f5f9', color: '#475569' };
        return (
          <span style={{
            fontSize: '0.68rem', fontWeight: 600, padding: '4px 10px',
            borderRadius: 6, background: statusStyle.bg, color: statusStyle.color,
            textTransform: 'capitalize',
          }}>
            {statusStyle.label}
          </span>
        );
      },
      name: 'Status',
    },
  ];

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1a1a2e', margin: 0, lineHeight: 1.3 }}>
              User Management
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0', fontWeight: 400 }}>
              Manage system users and their roles
            </p>
          </div>
          <button
            onClick={() => handleOpenModal(defaultUser)}
            style={{
              padding: '7px 16px', borderRadius: 8, border: 'none',
              background: '#7B1113', color: '#fff', fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <FiPlus size={14} /> Add User
          </button>
        </div>
        <div style={{ height: 1, background: 'linear-gradient(to right, #7B1113, transparent)', opacity: 0.3 }} />
      </div>

      <PageLoader loading={loading} error={null}>
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #f0eded',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
        }}>
          <DataTable
            isPagination={true}
            totalRecords={totalRecords}
            rowsPerPageOptions={pagination.limit}
            pageNo={pagination.pageNo}
            columns={columns}
            rows={users}
            uniqueRowId="id"
            selectionMode="multiple"
            leftItems={
              <>
                <RefreshPlugin onClick={fetchList} />
              </>
            }
            rightItems={
              <>
                <DeleteConfirmationPasswordPopover 
                  title={`Are you sure you want to delete ${selectedRows.length} record(s)?`}  
                  onDelete={(password) => handleDelete(password)}  
                  passwordInput 
                  disabled={selectedRows.length === 0} 
                />
              </>
            }
            onRowsPerPageChange={(pageNumber, rowsPerPage) =>
              setPagination({ pageNo: pageNumber, limit: rowsPerPage })
            }
            onPageChange={(newPageNumber) => setPagination({ ...pagination, pageNo: newPageNumber })}
            onSelection={(selectedRows) => setSelectedRows?.(selectedRows)}
          />
          {!users?.length ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>No users found</p>
            </div>
          ) : null}
        </div>
      </PageLoader>

      {openModal && (
        <ManageUserDialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          onConfirm={handleConfirm}
          data={modalData}
        />
      )}
    </div>
  );
}
