import { Dialog } from "/src/components/dialog/Dialog";
import { CustomPasswordInput } from "/src/components/formFields/CustomPasswordInput";
import { useFormik } from "formik";
import React from "react";
import * as Yup from 'yup';
import { createUser, updateUserData } from "./_lib/user.actions";

const getValidationSchema = (isUpdated) => {
    return Yup.object().shape({
        fullName: Yup.string().required('Full Name is required'),
        username: Yup.string().required('Username is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        phone: Yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Phone must be in international format (e.g., +251911234567)'),
        role: Yup.string().required('Role is required'),
        password: isUpdated ? Yup.string() : Yup.string().required('Password is required'),
        confirm_password: isUpdated ? Yup.string() : Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm Password is required'),
    });
}

export const ManageUserDialog = (props) => {
    const { open, onClose, onConfirm, data } = props;
    const [loading, setLoading] = React.useState(false);
    const isUpdated = data?._id ? true : false;

    const {
        values,
        errors,
        handleChange,
        handleSubmit,
        handleBlur,
        setFieldValue,
    } = useFormik({
        initialValues: {
            username: data?.username || '',
            email: data?.email || '',
            phone: data?.phone || '',
            role: data?.role || '',
            fullName: data?.fullName || '',
            password: '',
            confirm_password: '',
        },
        validationSchema: getValidationSchema(isUpdated),
        onSubmit: async (values) => {
            setLoading(true);
            const payload = {
                username: values.username,
                email: values.email,
                phone: values.phone,
                role: values.role,
                fullName: values.fullName,
                ...(isUpdated ? {} : { password: values.password }),
            };

            const res = isUpdated
                ? await updateUserData({ id: data._id, ...payload })
                : await createUser(payload);

            if (res.success) {
                onConfirm();
            }
            setLoading(false);
        }
    })

    return (
        <Dialog
            title={isUpdated ? "Update User" : "Create User"}
            onClose={onClose}
            open={open}
        >
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Username *</label>
                        <input
                            type="text"
                            name="username"
                            value={values.username}
                            onChange={handleChange}
                            disabled={isUpdated}
                            style={{
                                width: '100%', padding: '9px 12px', borderRadius: 8,
                                border: errors.username ? '1px solid #dc2626' : '1px solid #e2e8f0',
                                fontSize: '0.8rem', outline: 'none',
                                opacity: isUpdated ? 0.6 : 1,
                            }}
                        />
                        {errors.username && (
                            <p style={{ fontSize: '0.7rem', color: '#dc2626', margin: '4px 0 0' }}>{errors.username}</p>
                        )}
                    </div>

                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Full Name *</label>
                        <input
                            type="text"
                            name="fullName"
                            value={values.fullName}
                            onChange={handleChange}
                            style={{
                                width: '100%', padding: '9px 12px', borderRadius: 8,
                                border: errors.fullName ? '1px solid #dc2626' : '1px solid #e2e8f0',
                                fontSize: '0.8rem', outline: 'none',
                            }}
                        />
                        {errors.fullName && (
                            <p style={{ fontSize: '0.7rem', color: '#dc2626', margin: '4px 0 0' }}>{errors.fullName}</p>
                        )}
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            style={{
                                width: '100%', padding: '9px 12px', borderRadius: 8,
                                border: errors.email ? '1px solid #dc2626' : '1px solid #e2e8f0',
                                fontSize: '0.8rem', outline: 'none',
                            }}
                        />
                        {errors.email && (
                            <p style={{ fontSize: '0.7rem', color: '#dc2626', margin: '4px 0 0' }}>{errors.email}</p>
                        )}
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Phone (for SMS notifications)</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="+251911234567"
                            value={values.phone}
                            onChange={handleChange}
                            style={{
                                width: '100%', padding: '9px 12px', borderRadius: 8,
                                border: errors.phone ? '1px solid #dc2626' : '1px solid #e2e8f0',
                                fontSize: '0.8rem', outline: 'none',
                            }}
                        />
                        {errors.phone && (
                            <p style={{ fontSize: '0.7rem', color: '#dc2626', margin: '4px 0 0' }}>{errors.phone}</p>
                        )}
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Role *</label>
                        <select
                            name="role"
                            value={values.role}
                            onChange={(e) => setFieldValue("role", e.target.value)}
                            style={{
                                width: '100%', padding: '9px 12px', borderRadius: 8,
                                border: errors.role ? '1px solid #dc2626' : '1px solid #e2e8f0',
                                fontSize: '0.8rem', outline: 'none',
                            }}
                        >
                            <option value="">Select a role</option>
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="evaluator">Evaluator</option>
                        </select>
                        {errors.role && (
                            <p style={{ fontSize: '0.7rem', color: '#dc2626', margin: '4px 0 0' }}>{errors.role}</p>
                        )}
                    </div>

                    {!isUpdated && (
                        <>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Password *</label>
                                <CustomPasswordInput
                                    name="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(errors.password)}
                                />
                                {errors.password && (
                                    <p style={{ fontSize: '0.7rem', color: '#dc2626', margin: '4px 0 0' }}>{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Confirm Password *</label>
                                <CustomPasswordInput
                                    name="confirm_password"
                                    value={values.confirm_password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(errors.confirm_password)}
                                />
                                {errors.confirm_password && (
                                    <p style={{ fontSize: '0.7rem', color: '#dc2626', margin: '4px 0 0' }}>{errors.confirm_password}</p>
                                )}
                            </div>
                        </>
                    )}

                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                        <button
                            type={loading ? "button" : "submit"}
                            disabled={loading}
                            style={{
                                padding: '8px 20px', borderRadius: 8, border: 'none',
                                background: loading ? '#94a3b8' : '#7B1113', color: '#fff',
                                fontSize: '0.8rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: '#fff', borderRadius: '50%',
                                        animation: 'spin 0.6s linear infinite',
                                    }} />
                                    {isUpdated ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (isUpdated ? 'Update' : 'Create')}
                        </button>
                    </div>
                </div>
            </form>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </Dialog>
    )
}
