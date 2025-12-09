import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../../api/auditService';
import type { AuditLog } from '../../types/audit';
import { toast } from 'react-hot-toast';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

const AuditLogPage: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState<'VERIFYING' | 'VALID' | 'INVALID'>('VERIFYING');

    useEffect(() => {
        const fetchAndVerifyLogs = async () => {
            try {
                setLoading(true);
                const fetchedLogs = await getAuditLogs();
                // Logs come from DB newest first if we use default findAll, let's reverse for chaining
                const sortedLogs = [...fetchedLogs].sort((a, b) => a.id - b.id);
                setLogs(sortedLogs);
                verifyChain(sortedLogs);
            } catch (error) {
                toast.error("Failed to fetch audit logs.");
                setVerificationStatus('INVALID');
            } finally {
                setLoading(false);
            }
        };
        fetchAndVerifyLogs();
    }, []);

    const verifyChain = async (logsToVerify: AuditLog[]) => {
        // Simple client-side verification for demonstration
        for (let i = 0; i < logsToVerify.length; i++) {
            const currentLog = logsToVerify[i];
            const previousHash = i === 0 ? "0" : logsToVerify[i-1].currentHash;

            if (currentLog.previousHash !== previousHash) {
                setVerificationStatus('INVALID');
                toast.error(`Tampering detected! Chain broken at log ID: ${currentLog.id}`);
                return;
            }
        }
        setVerificationStatus('VALID');
    };

    if (loading) return <div>Loading and verifying audit logs...</div>;

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Audit Logs</h1>
                {verificationStatus === 'VALID' && (
                     <div className="flex items-center text-green-500 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-full">
                        <ShieldCheck size={18} className="mr-2"/>
                        <span className="text-sm font-semibold">Chain Valid</span>
                     </div>
                )}
                 {verificationStatus === 'INVALID' && (
                     <div className="flex items-center text-red-500 bg-red-100 dark:bg-red-900/50 px-3 py-1 rounded-full">
                        <ShieldAlert size={18} className="mr-2"/>
                        <span className="text-sm font-semibold">Chain Invalid!</span>
                     </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="th-style">Timestamp</th>
                            <th className="th-style">User</th>
                            <th className="th-style">Action</th>
                            <th className="th-style">Details</th>
                            <th className="th-style">Hash</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                       {logs.map(log => (
                           <tr key={log.id}>
                               <td className="td-style font-mono text-xs">{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</td>
                               <td className="td-style">{log.username}</td>
                               <td className="td-style font-semibold">{log.action}</td>
                               <td className="td-style text-sm text-gray-500">{log.details}</td>
                               <td className="td-style font-mono text-xs text-gray-400" title={log.currentHash}>{log.currentHash.substring(0, 12)}...</td>
                           </tr>
                       ))}
                    </tbody>
                 </table>
            </div>
        </div>
    );
};

const thStyle = "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider";
const tdStyle = "px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200";

export default AuditLogPage;