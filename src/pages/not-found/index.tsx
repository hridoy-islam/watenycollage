import { useRouter } from '@/routes/hooks';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="bg-white h-screen flex flex-col items-center justify-center  text-center">
      <div> 

     
      <span className="bg-gradient-to-b from-background to-primary bg-clip-text text-[10rem] font-extrabold leading-none text-transparent">
        404
      </span>
      <h2 className="font-heading my-2 text-2xl font-bold ">
        Something&apos;s missing
      </h2>
      <p>
        Sorry, the page you are looking for doesn&apos;t exist or has been
        moved.
      </p>
      <div className="mt-8 flex justify-center gap-2">
      
        <Button onClick={() => router.push('/')} variant="ghost" size="lg">
          Back to Home
        </Button>
      </div>
      </div>
    </div>
  );
}
