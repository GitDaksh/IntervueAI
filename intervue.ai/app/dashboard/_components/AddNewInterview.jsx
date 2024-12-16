'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chatSession } from '@/utils/GeminiAiModal';
import { LoaderCircle } from 'lucide-react';
import { MockInterview } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import moment from 'moment/moment';
import { db } from '@/utils/db';

const AddNewInterview = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const { user } = useUser();

  const onSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    console.log(jobPosition, jobDesc, jobExperience);

    const InputPrompt='Job position: '+jobPosition+', Job description: '+jobDesc+'Years of Experience: '+jobExperience+', Depending on job position, description and years of experience, give me '+process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT+' interview questions along with answer in JSON format, give me question and answer field on JSON'

    const result = await chatSession.sendMessage(InputPrompt);
    const MockJsonResp = (result.response.text()).replace('```json', '').replace('```', '')

    console.log(JSON.parse(MockJsonResp));
    setJsonResponse(MockJsonResp);

    if(MockJsonResp) {
        const resp = await db.insert(MockInterview)
        .values({
            mockId:uuidv4(),
            jsonMockResp:MockJsonResp,
            jobPosition:jobPosition,
            jobDesc:jobDesc,
            jobExperience:jobExperience,
            createdBy:user?.primaryEmailAddress?.emailAddress,
            createdAt:moment().format('DD-MM-yyyy')
        }).returning({id: MockInterview.id});
    } else {
        console.log('some error occured')
    }  

    console.log('Inserted ID: ', resp);

    setLoading(false);
  }

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center">+ Add New</h2>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Tell us more about your Job Interviewing</DialogTitle>
            
            {/* Move the form outside of DialogDescription */}
            <form onSubmit={onSubmit} className="space-y-4">
              <h2 className="text-lg">Add details about your Job position/role, Job description and years of experience</h2>

              <div>
                <label className="block mb-2">Job Role/Job Position</label>
                <Input 
                  placeholder="Ex. FullStack Developer" 
                  required
                  value={jobPosition}
                  onChange={(event) => setJobPosition(event.target.value)}
                />
              </div>
              
              <div>
                <label className="block mb-2">Job Description/Tech Stack (In short)</label>
                <Textarea 
                  placeholder="Ex. React, Angular, NodeJS, MySql etc." 
                  required
                  value={jobDesc}
                  onChange={(event) => setJobDesc(event.target.value)}
                />
              </div>
              
              <div>
                <label className="block mb-2">Years of Experience</label>
                <Input 
                  placeholder="Ex. 5" 
                  type="number" 
                  max="50" 
                  required
                  value={jobExperience}
                  onChange={(event) => setJobExperience(event.target.value)}
                />
              </div>

              <div className="flex gap-5 justify-end">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading?
                    <>
                    <LoaderCircle className='animate-spin'/>Generating from AI
                    </>:'Start Interview'  
                }
                    </Button>
              </div>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNewInterview;