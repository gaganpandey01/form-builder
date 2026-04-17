import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { responseService } from '../../services/responseServices';
import type { FormResponse } from '../../types';
import './ResponseList.css';
//comment added
export const ResponseList: React.FC = () => {
    const { formId } = useParams<{ formId: string }>();
    const [responses, setResponses] = useState<FormResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (formId) {
            loadResponses();
        }
    }, [formId, currentPage]);

    const loadResponses = async () => {
        try {
            setLoading(true);
            const result = await responseService.getFormResponses(formId!, currentPage, 10);
            if (result.success) {
                setResponses(result.data.data);
                setTotalPages(result.data.totalPages);
            }
        } catch (error) {
            console.error('Error loading responses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this response?')) return;

        try {
            await responseService.deleteResponse(id);
            loadResponses();
        } catch (error) {
            console.error('Error deleting response:', error);
        }
    };

    if (loading) return <div className="loading">Loading responses...</div>;

    return (
        <div className="response-list">
            <h1>Form Responses</h1>

            {responses.length === 0 ? (
                <p className="no-responses">No responses yet.</p>
            ) : (
                <>
                    <div className="responses-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Submitted At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {responses.map(response => (
                                    <tr key={response.id}>
                                        <td>{response.userIdentifier}</td>
                                        <td>{new Date(response.submittedAt || '').toLocaleString()}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(response.id!)}
                                                className="btn-danger btn-small"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
