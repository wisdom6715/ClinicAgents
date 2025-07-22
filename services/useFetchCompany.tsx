'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

interface Hospital {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
  organization?: string;
  phoneNumber?: string;
}

interface UseCompanyReturn {
  hospital: Hospital | null;
  loading: boolean;
  error: string | null;
}

interface UseCompanyParams {
  userId?: string;
}

const useHospital = ({ userId }: UseCompanyParams): UseCompanyReturn => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHospital = async ({ userId }: UseCompanyParams) => {
      const HospitalCollectionRef = collection(db, 'users');
      const results: Hospital[] = [];
    
      try {
        if (userId) {
          const q2 = query(HospitalCollectionRef, where('userId', '==', userId));
          const snap2 = await getDocs(q2);
          console.log('Documents for userId:', userId, snap2.docs.map(doc => doc.data()));
          snap2.forEach(doc => {
            if (!results.find(r => r.id === doc.id)) {
              results.push({ id: doc.id, ...doc.data() } as Hospital);
            }
          });
        }
    
        if (results.length === 0) {
          setError('Company not found');
          setHospital(null);
        } else {
          setError(null);
          setHospital(results[0]);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
        setHospital(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHospital({ userId });
  }, [ userId]);

  return { hospital, loading, error };
};

export default useHospital;