import React, { useEffect, useState } from 'react';
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/departmentService';
import type { Department } from '../../types/user';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { Edit, Trash2, Building, Users, Search, Filter, Briefcase } from 'lucide-react';
import styled from 'styled-components';
import Loader from '../../components/common/Loader';
import HoverButton from '../../components/common/HoverButton';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const DepartmentManagementPage: React.FC = () => {
    const { showError, showSuccess } = useToast();
    const { hasPermission } = usePermissions();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentDept, setCurrentDept] = useState<Department | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'users'>('name');
    
    const [deptName, setDeptName] = useState('');
    const [deptDescription, setDeptDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const data = await getAllDepartments();
            setDepartments(data);
        } catch (error) {
            showError('Error', 'Failed to fetch departments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleOpenModal = (dept: Department | null = null) => {
        setCurrentDept(dept);
        setDeptName(dept ? dept.name : '');
        setDeptDescription(dept ? dept.description || '' : '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentDept(null);
        setDeptName('');
        setDeptDescription('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            if (currentDept) {
                await updateDepartment(currentDept.id, deptName, deptDescription);
                showSuccess('Success', 'Department updated!');
            } else {
                await createDepartment(deptName, deptDescription);
                showSuccess('Success', 'Department created!');
            }
            handleCloseModal();
            fetchDepartments();
        } catch (error: any) {
            showError('Error', error.response?.data?.message || 'Failed to save.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (id: number) => {
        setDepartmentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (departmentToDelete === null) return;
        
        setIsDeleting(true);
        try {
            await deleteDepartment(departmentToDelete);
            showSuccess('Success', 'Department deleted!');
            fetchDepartments();
            setIsDeleteModalOpen(false);
            setDepartmentToDelete(null);
        } catch (error: any) {
            showError('Error', error.response?.data?.message || 'Failed to delete.');
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setDepartmentToDelete(null);
    };

    // Filter and sort departments
    const filteredDepartments = departments
        .filter(dept => 
            dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dept.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else {
                // Assuming we have userCount property, or sort by something else
                return 0; // Default sort
            }
        });

    const getDeptColor = (index: number) => {
        const colors = [
            { bg: 'rgba(46, 151, 197, 0.1)', border: 'rgba(46, 151, 197, 0.3)', icon: 'linear-gradient(135deg, rgb(46, 151, 197), rgb(36, 121, 167))', text: 'rgb(46, 151, 197)' },
            { bg: 'rgba(150, 129, 158, 0.1)', border: 'rgba(150, 129, 158, 0.3)', icon: 'linear-gradient(135deg, rgb(150, 129, 158), rgb(120, 99, 128))', text: 'rgb(150, 129, 158)' },
            { bg: 'rgba(229, 151, 54, 0.1)', border: 'rgba(229, 151, 54, 0.3)', icon: 'linear-gradient(135deg, rgb(229, 151, 54), rgb(199, 121, 24))', text: 'rgb(229, 151, 54)' },
            { bg: 'rgba(46, 151, 197, 0.08)', border: 'rgba(46, 151, 197, 0.25)', icon: 'linear-gradient(135deg, rgb(70, 180, 230), rgb(46, 151, 197))', text: 'rgb(70, 180, 230)' }
        ];
        return colors[index % colors.length];
    };

    if (loading) {
        return (
            <LoaderContainer>
                <Loader />
            </LoaderContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <HeaderContent>
                    <PageTitle>
                        <Building size={32} />
                        Department Management
                    </PageTitle>
                    <PageSubtitle>Manage organizational departments and teams</PageSubtitle>
                </HeaderContent>
                
                {hasPermission('DEPARTMENT_CREATE') && (
                    <AddDeptButton 
                        onClick={() => handleOpenModal()}
                        textOne="Add Department"
                        textTwo="Create Dept"
                        width="200px"
                        height="55px"
                    />
                )}
            </PageHeader>

            <ControlsContainer>
                <SearchContainer>
                    <SearchIcon>
                        <Search size={20} />
                    </SearchIcon>
                    <SearchInput
                        type="text"
                        placeholder="Search departments by name, description, or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </SearchContainer>
                
                <SortContainer>
                    <FilterIcon>
                        <Filter size={20} />
                    </FilterIcon>
                    <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'users')}>
                        <option value="name">Sort by Name</option>
                        <option value="users">Sort by Users</option>
                    </SortSelect>
                </SortContainer>
            </ControlsContainer>

            <StatsContainer>
                <StatCard style={{ background: 'rgba(46, 151, 197, 0.05)', borderColor: 'rgba(46, 151, 197, 0.2)' }}>
                    <StatIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                        <Building size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatLabel>Total Departments</StatLabel>
                        <StatValue>{departments.length}</StatValue>
                    </StatContent>
                </StatCard>
                
                <StatCard style={{ background: 'rgba(150, 129, 158, 0.05)', borderColor: 'rgba(150, 129, 158, 0.2)' }}>
                    <StatIcon style={{ background: 'rgba(150, 129, 158, 0.1)', color: 'rgb(150, 129, 158)' }}>
                        <Users size={24} />
                    </StatIcon>
                    <StatContent>
                        <StatLabel>Total Departments</StatLabel>
                        <StatValue>{departments.length}</StatValue>
                    </StatContent>
                </StatCard>
            </StatsContainer>

            <DepartmentGrid>
                {filteredDepartments.map((dept, index) => {
                    const colors = getDeptColor(index);
                    
                    return (
                        <DepartmentCard key={dept.id} style={{ borderColor: colors.border, background: colors.bg }}>
                            <DeptHeader>
                                <DeptIcon style={{ background: colors.icon }}>
                                    <Building size={24} />
                                </DeptIcon>
                                <DeptInfo>
                                    <DeptName style={{ color: colors.text }}>
                                        {dept.name}
                                    </DeptName>
                                </DeptInfo>
                            </DeptHeader>
                            
                            <DeptDescription>
                                {dept.description || 'No description provided'}
                            </DeptDescription>
                            
                            <DeptMeta>
                                <MetaItem>
                                    <Building size={14} />
                                    <span>{dept.name}</span>
                                </MetaItem>
                            </DeptMeta>
                            
                            {(hasPermission('DEPARTMENT_UPDATE') || hasPermission('DEPARTMENT_DELETE')) && (
                                <DeptActions>
                                    {hasPermission('DEPARTMENT_UPDATE') && (
                                        <EditButton 
                                            onClick={() => handleOpenModal(dept)}
                                            style={{ color: colors.text, borderColor: colors.border }}
                                        >
                                            <Edit size={18} />
                                            Edit
                                        </EditButton>
                                    )}
                                    {hasPermission('DEPARTMENT_DELETE') && (
                                        <DeleteButton onClick={() => handleDelete(dept.id)}>
                                            <Trash2 size={18} />
                                            Delete
                                        </DeleteButton>
                                    )}
                                </DeptActions>
                            )}
                        </DepartmentCard>
                    );
                })}
            </DepartmentGrid>

            {filteredDepartments.length === 0 && (
                <EmptyState>
                    <EmptyIcon>
                        <Building size={48} />
                    </EmptyIcon>
                    <EmptyText>
                        {searchQuery ? 'No departments found matching your search' : 'No departments found'}
                    </EmptyText>
                    <EmptySubtext>
                        {searchQuery 
                            ? 'Try a different search term or clear the search'
                            : 'Click "Add Department" to create your first department'}
                    </EmptySubtext>
                </EmptyState>
            )}

            <CustomModal $isOpen={isModalOpen} onClick={handleCloseModal}>
                <ModalWrapper onClick={(e) => e.stopPropagation()}>
                    <ModalHeader>
                        <ModalTitle>
                            <Building size={28} />
                            {currentDept ? 'Edit Department' : 'Create New Department'}
                        </ModalTitle>
                    </ModalHeader>
                    <ModalContent onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label>
                                <LabelIcon style={{ background: 'rgba(46, 151, 197, 0.1)', color: 'rgb(46, 151, 197)' }}>
                                    <Building size={16} />
                                </LabelIcon>
                                Department Name
                            </Label>
                            <Input
                                type="text"
                                value={deptName}
                                onChange={(e) => setDeptName(e.target.value)}
                                placeholder="Enter department name (e.g., Engineering, Marketing)"
                                required
                                style={{ borderLeft: '4px solid rgb(46, 151, 197)' }}
                            />
                        </FormGroup>
                        
                        <FormGroup>
                            <Label>
                                <LabelIcon style={{ background: 'rgba(229, 151, 54, 0.1)', color: 'rgb(229, 151, 54)' }}>
                                    <Briefcase size={16} />
                                </LabelIcon>
                                Description
                            </Label>
                            <TextArea
                                value={deptDescription}
                                onChange={(e) => setDeptDescription(e.target.value)}
                                rows={3}
                                placeholder="Describe the department's function, responsibilities, and purpose..."
                                style={{ borderLeft: '4px solid rgb(229, 151, 54)' }}
                            />
                        </FormGroup>
                        
                        <ModalActions>
                            <CancelButtonStyled type="button" onClick={handleCloseModal}>
                                Cancel
                            </CancelButtonStyled>
                            <SaveButton type="submit" disabled={isSubmitting}>
                                <div className="svg-wrapper-1">
                                    <div className="svg-wrapper">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={30} height={30} className="icon">
                                            <path d="M22,15.04C22,17.23 20.24,19 18.07,19H5.93C3.76,19 2,17.23 2,15.04C2,13.07 3.43,11.44 5.31,11.14C5.28,11 5.27,10.86 5.27,10.71C5.27,9.33 6.38,8.2 7.76,8.2C8.37,8.2 8.94,8.43 9.37,8.8C10.14,7.05 11.13,5.44 13.91,5.44C17.28,5.44 18.87,8.06 18.87,10.83C18.87,10.94 18.87,11.06 18.86,11.17C20.65,11.54 22,13.13 22,15.04Z" />
                                        </svg>
                                    </div>
                                </div>
                                <span>{isSubmitting ? 'Saving...' : (currentDept ? 'Update Department' : 'Create Department')}</span>
                            </SaveButton>
                        </ModalActions>
                    </ModalContent>
                </ModalWrapper>
            </CustomModal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={cancelDelete}
                onConfirm={confirmDelete}
                title="Delete Department"
                message="Are you sure you want to delete this department? This action may affect users assigned to this department and cannot be undone."
                confirmText="Delete"
                isConfirming={isDeleting}
            />
        </PageContainer>
    );
};

// Styled Components
const PageContainer = styled.div`
    animation: fadeInUp 0.4s ease;
    padding: 2rem;

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const LoaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
`;

const PageHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.05), rgba(150, 129, 158, 0.05));
    border-radius: 20px;
    border: 2px solid rgba(46, 151, 197, 0.2);

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1.5rem;
        align-items: stretch;
        padding: 1rem;
    }
`;

const HeaderContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const PageTitle = styled.h1`
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`;

const PageSubtitle = styled.p`
    font-size: 1rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
    margin-left: 3.5rem;

    @media (max-width: 768px) {
        margin-left: 0;
    }
`;

const AddDeptButton = styled(HoverButton)`
    @media (max-width: 768px) {
        width: 100% !important;
    }
`;

const ControlsContainer = styled.div`
    display: flex;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 2px solid rgba(46, 151, 197, 0.2);
    box-shadow: 0 4px 12px var(--shadow);

    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const SearchContainer = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
`;

const SearchIcon = styled.div`
    position: absolute;
    left: 1rem;
    color: var(--text-tertiary);
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 3rem;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 0.9375rem;
    font-family: 'Poppins', sans-serif;
    color: var(--text-primary);
    transition: all 0.3s ease;

    &::placeholder {
        color: var(--text-tertiary);
    }

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }
`;

const SortContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
`;

const FilterIcon = styled.div`
    position: absolute;
    left: 1rem;
    color: var(--text-tertiary);
`;

const SortSelect = styled.select`
    padding: 0.875rem 1rem 0.875rem 3rem;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 0.9375rem;
    font-family: 'Poppins', sans-serif;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 180px;

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }

    option {
        background: var(--bg-secondary);
        color: var(--text-primary);
    }
`;

const StatsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
`;

const StatCard = styled.div`
    padding: 1.25rem;
    border: 2px solid;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const StatIcon = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StatContent = styled.div`
    flex: 1;
`;

const StatLabel = styled.div`
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
    font-family: 'Poppins', sans-serif;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const DepartmentGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const DepartmentCard = styled.div`
    background: var(--bg-secondary);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 8px 24px var(--shadow);
    transition: all 0.3s ease;
    border: 2px solid;
    display: flex;
    flex-direction: column;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px var(--shadow);
    }
`;

const DeptHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const DeptIcon = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
`;

const DeptInfo = styled.div`
    flex: 1;
    overflow: hidden;
`;

const DeptName = styled.h3`
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    font-family: 'Poppins', sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const DeptDescription = styled.p`
    font-size: 0.9375rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
    line-height: 1.5;
    margin-bottom: 1rem;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const DeptMeta = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding: 0.75rem;
    background: rgba(46, 151, 197, 0.05);
    border-radius: 10px;
`;

const MetaItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;

    svg {
        width: 14px;
        height: 14px;
    }
`;

const DeptActions = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-top: auto;
`;

const EditButton = styled.button`
    flex: 1;
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border: 2px solid;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--shadow);
    }
`;

const DeleteButton = styled.button`
    flex: 1;
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border: 2px solid rgba(239, 68, 68, 0.3);
    color: #EF4444;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
    }
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    background: var(--bg-secondary);
    border-radius: 20px;
    border: 2px dashed rgba(46, 151, 197, 0.2);
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, rgba(46, 151, 197, 0.1), rgba(150, 129, 158, 0.1));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(46, 151, 197);
    margin-bottom: 1.5rem;
`;

const EmptyText = styled.h3`
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    font-family: 'Poppins', sans-serif;
`;

const EmptySubtext = styled.p`
    font-size: 1rem;
    color: var(--text-secondary);
    font-family: 'Poppins', sans-serif;
`;

const CustomModal = styled.div<{ $isOpen: boolean }>`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const ModalWrapper = styled.div`
    background: var(--bg-secondary);
    border-radius: 24px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
    border: 2px solid rgba(46, 151, 197, 0.2);

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: var(--bg-primary);
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(46, 151, 197, 0.3);
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: rgba(46, 151, 197, 0.5);
    }
`;

const ModalHeader = styled.div`
    padding: 2rem 2rem 1rem 2rem;
    border-bottom: 2px solid var(--border-color);
`;

const ModalTitle = styled.h2`
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const ModalContent = styled.form`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const Label = styled.label`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary);
    font-family: 'Poppins', sans-serif;
`;

const LabelIcon = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
`;

const Input = styled.input`
    width: 100%;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.875rem 1rem;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;

    &::placeholder {
        color: var(--text-tertiary);
    }

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    background: var(--bg-primary);
    border: 2px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.875rem 1rem;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-family: 'Poppins', sans-serif;
    transition: all 0.3s ease;
    resize: vertical;

    &::placeholder {
        color: var(--text-tertiary);
    }

    &:focus {
        outline: none;
        border-color: rgb(46, 151, 197);
        box-shadow: 0 0 0 3px rgba(46, 151, 197, 0.1);
    }
`;

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 2px solid var(--border-color);
`;

const CancelButtonStyled = styled.button`
    padding: 0.875rem 1.75rem;
    background: var(--bg-secondary);
    border: 2px solid rgba(46, 151, 197, 0.3);
    border-radius: 12px;
    font-size: 0.9375rem;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
    color: rgb(46, 151, 197);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(46, 151, 197, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(46, 151, 197, 0.15);
    }
`;

const SaveButton = styled.button`
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    background: linear-gradient(135deg, rgb(46, 151, 197), rgb(150, 129, 158));
    color: white;
    fill: rgb(200, 200, 200);
    padding: 0.7em 1.5em;
    padding-left: 0.9em;
    display: flex;
    align-items: center;
    cursor: pointer;
    border: none;
    border-radius: 15px;
    font-weight: 700;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(46, 151, 197, 0.3);

    span {
        display: block;
        margin-left: 0.3em;
        transition: all 0.3s ease-in-out;
    }

    .svg-wrapper-1 {
        display: flex;
        align-items: center;
    }

    .svg-wrapper {
        display: flex;
        align-items: center;
        transform-origin: center center;
        transition: transform 0.3s ease-in-out;
    }

    svg {
        display: block;
        transform-origin: center center;
        transition: transform 0.3s ease-in-out;
    }

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, rgb(36, 121, 167), rgb(120, 99, 128));
        box-shadow: 0 6px 20px rgba(46, 151, 197, 0.4);
    }

    &:hover:not(:disabled) .svg-wrapper {
        transform: scale(1.25);
        transition: 0.5s linear;
    }

    &:hover:not(:disabled) svg {
        transform: translateX(1.2em) scale(1.1);
        fill: #fff;
    }

    &:hover:not(:disabled) span {
        opacity: 0;
        transition: 0.5s linear;
    }

    &:active:not(:disabled) {
        transform: scale(0.95);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    @media (max-width: 768px) {
        font-size: 16px;
        padding: 0.65em 1.25em;
    }
`;

export default DepartmentManagementPage;