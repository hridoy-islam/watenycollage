import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { GraduationCap, BookOpen, BookA as BookAIcon, FileText, Clock, Pencil, Trash2 } from 'lucide-react';
import moment from 'moment';
import { Resource } from './types';

interface ResourceCardProps {
  resource: Resource;
  onEdit: (resource: Resource) => void;
  onDelete: (id: string) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onEdit,
  onDelete
}) => {
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'introduction':
        return <GraduationCap className="h-4 w-4" />;
      case 'study-guide':
        return <BookOpen className="h-4 w-4" />;
      case 'lecture':
        return <BookAIcon className="h-4 w-4" />;
      case 'assignment':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'introduction':
        return 'bg-blue-500';
      case 'study-guide':
        return 'bg-green-500';
      case 'lecture':
        return 'bg-purple-500';
      case 'assignment':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDeadline = (deadline: string) => {
    return moment(deadline).format('DD-MM-YYYY');
  };

  if (resource.type === 'introduction') {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <GraduationCap className="h-6 w-6 text-watney" />
              </div>
              <div>
                <CardTitle>Course Introduction</CardTitle>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="icon"
                onClick={() => onEdit(resource)}
          className="text-watney hover:text-watney/90"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {/* <Button
                variant="default"
                size="icon"
                onClick={() => onDelete(resource.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button> */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="ql-snow leading-relaxed text-slate-700"
            dangerouslySetInnerHTML={{
              __html: resource.content || ''
            }}
          />
        </CardContent>
      </Card>
    );
  }

  if (resource.type === 'assignment') {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-300 p-2">
      {/* Left Side */}
      <div className="flex items-center gap-3 flex-1">
        <Badge className={`${getResourceTypeColor(resource.type)} p-2 text-white`}>
          {getResourceTypeIcon(resource.type)}
        </Badge>
        <h3 className="font-medium">{resource.title}</h3>
        <div className="flex items-center text-sm text-slate-600">
          <Clock className="ml-3 mr-1 h-4 w-4" />
          <span>Due: {formatDeadline(resource.deadline!)}</span>
        </div>
      </div>

      {/* Right Side (buttons) */}
      <div className="flex gap-2">
        <Button
          variant="default"
          size="icon"
          onClick={() => onEdit(resource)}
          className="text-watney hover:text-watney/90"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="default"
          size="icon"
          onClick={() => onDelete(resource.id)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


  return (
    <AccordionItem key={resource.id} value={resource.id}>
      <AccordionTrigger className="hover:no-underline py-2">
        <div className="flex w-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Badge
              className={`${getResourceTypeColor(resource.type)} p-2 text-white`}
            >
              {getResourceTypeIcon(resource.type)}
            </Badge>
            <span className="font-medium">{resource.title}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(resource);
              }}
              className="text-watney hover:text-watney/90"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(resource.id);
              }}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {resource.content ? (
              <div
                className="ql-snow leading-relaxed text-slate-700"
                dangerouslySetInnerHTML={{
                  __html: resource.content
                }}
              />
            ) : resource.fileUrl ? (
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
                {resource.type === 'lecture' ? (
                  <BookAIcon className="h-8 w-8 text-slate-400" />
                ) : (
                  <FileText className="h-8 w-8 text-slate-400" />
                )}
                <div>
                  <p className="font-medium">{resource.fileName}</p>
                  <p className="text-sm text-slate-500">
                    {resource.type === 'lecture' ? 'Video' : 'Document'} attachment
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ResourceCard;