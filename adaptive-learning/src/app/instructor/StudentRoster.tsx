'use client';

import { useState } from 'react';
import Link from 'next/link';

interface StudentData {
  id: string;
  full_name: string;
  email: string;
  progress: number;
  mastery: number;
  quizAvg: number;
  assignmentProgress: string;
  assignmentAvg: number;
  status: string;
}

interface ClassData {
  id: string;
  name: string;
  studentIds: string[];
}

interface StudentRosterProps {
  students: StudentData[];
  classes: ClassData[];
}

export default function StudentRoster({ students, classes }: StudentRosterProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');

  const filteredStudents = selectedClassId === 'all'
    ? students
    : students.filter(s => {
        const cls = classes.find(c => c.id === selectedClassId);
        return cls?.studentIds.includes(s.id);
      });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Student Roster</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <label htmlFor="class-filter" className="sr-only">Filter by class</label>
          <select
            id="class-filter"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            aria-label="Filter by class"
            className="w-full sm:w-auto text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Students ({students.length})</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.studentIds.length})
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]" aria-label="Student roster">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Student</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase text-center">Progress</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase text-center">Mastery</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase text-center">Quiz Avg</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase text-center">Assignments</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase text-center">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredStudents.map(student => (
              <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{student.full_name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{student.email}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm font-medium ${
                    student.mastery >= 80 ? 'text-green-600' :
                    student.mastery >= 70 ? 'text-yellow-600' :
                    student.mastery > 0 ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {student.mastery > 0 ? `${student.mastery}%` : '\u2014'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm font-medium ${
                    student.quizAvg >= 80 ? 'text-green-600' :
                    student.quizAvg >= 70 ? 'text-yellow-600' :
                    student.quizAvg > 0 ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {student.quizAvg > 0 ? `${student.quizAvg}%` : '\u2014'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {student.assignmentProgress !== '\u2014'
                      ? student.assignmentProgress
                      : '\u2014'
                    }
                    {student.assignmentAvg > 0 && (
                      <span className={`ml-1 ${student.assignmentAvg >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                        ({student.assignmentAvg}%)
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {student.status === 'Not Started' ? (
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      Not Started
                    </span>
                  ) : student.status === 'Complete' ? (
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Complete
                    </span>
                  ) : student.status === 'Struggling' ? (
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      Struggling
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      In Progress
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/instructor/student/${student.id}`}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {selectedClassId === 'all' ? 'No students enrolled yet.' : 'No students in this class.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
