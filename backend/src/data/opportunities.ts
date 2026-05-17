export type OpportunityType =
  | 'all'
  | 'internships'
  | 'hackathons'
  | 'remote'
  | 'fellowships';

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  status: 'done' | 'active' | 'pending';
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  rationale: string;
  logoUrl: string;
  types: OpportunityType[];
  missingSkills?: string[];
  coverLetter: string;
  roadmap: RoadmapStep[];
}

export const SEED_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'lumina-senior-pe',
    title: 'Senior Product Engineer',
    company: 'Lumina Systems',
    location: 'San Francisco, CA',
    matchScore: 92,
    rationale:
      'You excel in Python and React. Your "Neural-Stream" project aligns 95% with their tech stack requirements.',
    logoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCUv-nmKKjC8lds71V8PVVLysq2cR-d3NEzxnI5yOQu-XJehq3o24MPsKIjUSx_tDXh1zxN2iVG9S5SituM9m5xawXKtrfKv3AiovrrzaEZ0UgPhBK9qKd05m8L_YuoLPcb3efVTnyLW-D23KtY6a-MyeEsxWl_QZ01lwhcamUVuNatWZZUaqv8ZLjgiU6sBQnfK57S1jKDcjyt0vM9I2ZYcjX4oyMBaaDvF0EafahMo4VeyytLi65gQLEivRcXmQxGj2tZDC02vYo',
    types: ['all', 'remote'],
    coverLetter: `Dear Hiring Team at Lumina Systems,

I am writing to express my strong interest in the Senior Product Engineer position. Having built full-stack products with Python and React, I am particularly drawn to Lumina's focus on intelligent product experiences.

My background in scalable architecture and rapid prototyping aligns with your engineering culture. I would welcome the chance to contribute to your team.

Best regards,
{{name}}`,
    roadmap: [
      {
        id: '1',
        title: 'Research Company Culture',
        description:
          'Review their engineering blog and recent product launches.',
        status: 'done',
      },
      {
        id: '2',
        title: 'Polish Portfolio Case Study',
        description: 'Highlight the Neural-Stream project with metrics.',
        status: 'active',
      },
      {
        id: '3',
        title: 'Submit Application',
        description: 'Apply through the careers portal with tailored resume.',
        status: 'pending',
      },
    ],
  },
  {
    id: 'nebula-ml-intern',
    title: 'ML Infrastructure Intern',
    company: 'Nebula Cloud',
    location: 'Remote',
    matchScore: 85,
    rationale:
      'Your Python background and interest in LLMs match the internship core competencies perfectly.',
    logoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADM507z52FJ8qtr_gDE6Pzx-ILVUDf1Cr4FH9vUvzvCxSWlIVooNtxjZ6_7C0d4y-tfKoDAJxw9TEgLgOwh1dXSyrOIYxeL2Rsoyt0tz7ue9rhDr7D7ZFdXRB4vyJbJ9h4ip5klvxK6rLNDMBygL_fOPf72h9YtItG0lE1LD3syvGJGpua3MRnKWs1vHVUUx2h2b0m8jAMD9an8FNwpqUvtgQ9se17edo-873rKXM4q6iSAVt1_qes8-apPCuRQ_baOg6-AdE9Kro',
    types: ['all', 'internships', 'remote'],
    coverLetter: `Dear Nebula Cloud Team,

I am excited to apply for the ML Infrastructure Intern role. My experience with Python and distributed systems makes me a strong fit for your platform team.

I am eager to learn from your ML infrastructure experts and contribute to production tooling.

Best regards,
{{name}}`,
    roadmap: [
      {
        id: '1',
        title: 'Study ML Infra Docs',
        description: "Read Nebula's open-source tooling and blog posts.",
        status: 'done',
      },
      {
        id: '2',
        title: 'Prepare Technical Demo',
        description: 'Build a small pipeline example with TensorFlow.',
        status: 'active',
      },
      {
        id: '3',
        title: 'Submit Application',
        description: 'Complete the internship application form.',
        status: 'pending',
      },
    ],
  },
  {
    id: 'neuralflow-lead-react',
    title: 'Lead React Developer',
    company: 'NeuralFlow AI',
    location: 'Remote',
    matchScore: 84,
    rationale:
      'Strong React and state-management experience. Your dashboard work maps well to their AI interface goals.',
    logoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCUv-nmKKjC8lds71V8PVVLysq2cR-d3NEzxnI5yOQu-XJehq3o24MPsKIjUSx_tDXh1zxN2iVG9S5SituM9m5xawXKtrfKv3AiovrrzaEZ0UgPhBK9qKd05m8L_YuoLPcb3efVTnyLW-D23KtY6a-MyeEsxWl_QZ01lwhcamUVuNatWZZUaqv8ZLjgiU6sBQnfK57S1jKDcjyt0vM9I2ZYcjX4oyMBaaDvF0EafahMo4VeyytLi65gQLEivRcXmQxGj2tZDC02vYo',
    types: ['all', 'remote', 'hackathons'],
    missingSkills: ['GraphQL Federation', 'AWS Serverless'],
    coverLetter: `Dear Hiring Team at NeuralFlow AI,

I am writing to express my strong interest in the Lead React Developer position. Having spent the last 5 years scaling enterprise-grade React applications, I am particularly drawn to NeuralFlow's commitment to low-latency AI interfaces.

My background in optimizing complex state management systems and mentoring high-performing engineering teams aligns perfectly with the goals of this role.

Best regards,
{{name}}`,
    roadmap: [
      {
        id: '1',
        title: 'Research Company Culture',
        description:
          'Focus on their recent Series B announcement and AI safety blog post.',
        status: 'done',
      },
      {
        id: '2',
        title: 'Polish React Portfolio',
        description:
          'Highlight the "Dashboard v3" project with its Framer Motion integrations.',
        status: 'active',
      },
      {
        id: '3',
        title: 'Submit Application',
        description:
          'Finalize through the Greenhouse portal with personalized tags.',
        status: 'pending',
      },
    ],
  },
  {
    id: 'metaverse-designer',
    title: 'Senior Product Designer',
    company: 'Metaverse Systems',
    location: 'New York, NY',
    matchScore: 72,
    rationale:
      'Cross-functional product sense from hackathon wins; design systems experience is a plus.',
    logoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADM507z52FJ8qtr_gDE6Pzx-ILVUDf1Cr4FH9vUvzvCxSWlIVooNtxjZ6_7C0d4y-tfKoDAJxw9TEgLgOwh1dXSyrOIYxeL2Rsoyt0tz7ue9rhDr7D7ZFdXRB4vyJbJ9h4ip5klvxK6rLNDMBygL_fOPf72h9YtItG0lE1LD3syvGJGpua3MRnKWs1vHVUUx2h2b0m8jAMD9an8FNwpqUvtgQ9se17edo-873rKXM4q6iSAVt1_qes8-apPCuRQ_baOg6-AdE9Kro',
    types: ['all', 'fellowships'],
    coverLetter: `Dear Metaverse Systems Team,

I am interested in the Senior Product Designer role and would bring a builder mindset from shipping full-stack products end to end.

Best regards,
{{name}}`,
    roadmap: [
      {
        id: '1',
        title: 'Portfolio Review',
        description: 'Curate 3 case studies with measurable outcomes.',
        status: 'active',
      },
      {
        id: '2',
        title: 'Submit Application',
        description: 'Send portfolio link with tailored intro.',
        status: 'pending',
      },
    ],
  },
];

export const DEFAULT_SKILL_TAGS = ['Python', 'React', 'TensorFlow', 'Node.js'];
export const DEFAULT_AI_STRENGTHS = [
  'Full-Stack Architecture',
  'Rapid Prototyping',
  'Scalable Systems',
];
