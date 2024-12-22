import StudentFilter from "@/components/shared/student-filter";
import { StudentsTable } from "@/components/shared/students-table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function StudentsPage() {
    return (
        <>
            <div className="mb-3 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">All Students</h1>
                <Button className="bg-supperagent text-white hover:bg-supperagent/90"><Link to='new'>New Student</Link></Button>
            </div>
            <StudentFilter />
            <StudentsTable />
        </>
    )
}