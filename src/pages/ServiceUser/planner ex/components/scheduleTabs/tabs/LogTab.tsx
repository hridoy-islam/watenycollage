
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const logData = [
  {
    details: 'Schedule updated',
    actionTaken: 'Mahi - 25 Jun, 2025',
  },
  {
    details: 'Schedule cancelled due to unforeseen circumstances',
    actionTaken: 'Mahi - 18 Jun, 2025',
  },
];

const LogTab = () => {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Details</TableHead>
            <TableHead className='text-right'>Action Taken</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logData.map((log, index) => (
            <TableRow key={index}>
              <TableCell>{log.details}</TableCell>
              <TableCell className='text-right'>{log.actionTaken}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LogTab;
