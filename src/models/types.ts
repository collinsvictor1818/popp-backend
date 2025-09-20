export interface CandidateDTO {
  phone_number: string;      // incoming payload field names
  first_name: string;
  last_name: string;
  email_address: string;
}

export interface ApplicationEvent {
  id: string;
  job_id: string;
  candidate_id: string;
  candidate: CandidateDTO;
}
