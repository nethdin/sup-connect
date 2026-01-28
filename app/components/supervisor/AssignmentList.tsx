'use client';

import { useState, useEffect } from 'react';
import { Assignment } from '@/app/lib/types';
import { assignmentAPI, supervisorAPI } from '@/app/lib/api-client';
import { useToast } from '@/app/context/ToastContext';

export default function AssignmentList() {
  const { addToast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assignmentAPI.getSupervisorAssignments();
      setAssignments(data.assignments);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (studentId: string) => {
    try {
      setToggling(studentId);
      const result = await supervisorAPI.toggleStudentEditPermission(studentId);

      // Update local state
      setAssignments(prevAssignments =>
        prevAssignments.map(assignment =>
          assignment.studentId === studentId
            ? { ...assignment, canEditIdea: result.canEditIdea }
            : assignment
        )
      );

      addToast(result.message, 'success');
    } catch (err) {
      console.error('Error toggling permission:', err);
      addToast(err instanceof Error ? err.message : 'Failed to toggle permission', 'error');
    } finally {
      setToggling(null);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      setRemoving(studentId);
      await assignmentAPI.removeStudent(studentId);

      // Remove from local state
      setAssignments(prevAssignments =>
        prevAssignments.filter(assignment => assignment.studentId !== studentId)
      );

      addToast('Student removed successfully', 'success');
      setConfirmRemove(null);
    } catch (err) {
      console.error('Error removing student:', err);
      addToast(err instanceof Error ? err.message : 'Failed to remove student', 'error');
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={fetchAssignments}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p>No students assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">
                {assignment.student?.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {assignment.student?.email}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
              </p>

              {/* Edit Permission Status */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Project Idea Editing:
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${assignment.canEditIdea
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                  }`}>
                  {assignment.canEditIdea ? '✓ Allowed' : '🔒 Locked'}
                </span>
              </div>
            </div>

            {/* Toggle Permission Button */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleTogglePermission(assignment.studentId)}
                disabled={toggling === assignment.studentId}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${assignment.canEditIdea
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {toggling === assignment.studentId ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : assignment.canEditIdea ? (
                  '🔒 Lock Editing'
                ) : (
                  '🔓 Allow Editing'
                )}
              </button>

              {/* Remove Student Button */}
              {confirmRemove === assignment.studentId ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRemoveStudent(assignment.studentId)}
                    disabled={removing === assignment.studentId}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    {removing === assignment.studentId ? 'Removing...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setConfirmRemove(null)}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmRemove(assignment.studentId)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                  <i className="fa-solid fa-user-minus mr-2"></i>
                  Remove Student
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
