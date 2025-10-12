

'use client';

import { useFormStatus } from 'react-dom';
import { signIn } from '@/app/auth/actions'; 
import React from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      className={`
        w-full py-3 mt-6 rounded-lg font-semibold transition duration-200
        ${pending 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
        }
      `}
    >
      {pending ? 'Sedang Memproses...' : 'Masuk'}
    </button>
  );
}



export default function LoginPage() {
  

  const [errorMessage, setErrorMessage] = React.useState(''); 


  const handleSubmit = async (formData: FormData) => {
    setErrorMessage(''); 
    

    const result = await signIn(formData);
    
   
    if (result && result) {
        setErrorMessage(result.error);
    }

  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl">
        
        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          Selamat Datang Kembali
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Silakan masuk untuk melanjutkan proyek
        </p>

     
        <form className="mt-8 space-y-6" action={handleSubmit}> 
          
         
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Alamat Email</label>
              <input
                id="email"
                name="email" 
                type="email"
                required
                placeholder="Alamat Email"
                className="relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
            
       
            <div>
              <label htmlFor="password" className="sr-only">Kata Sandi</label>
              <input
                id="password"
                name="password" 
                type="password"
                required
                placeholder="Kata Sandi"
                className="relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>
          
        
          {errorMessage && (
            <p className="text-sm text-center font-medium text-red-600">
              {errorMessage}
            </p>
          )}

         
          <SubmitButton />

        </form>
        
      </div>
    </div>
  );
}

