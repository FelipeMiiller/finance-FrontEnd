
import { query as q, query } from "faunadb";
import { fauna } from "../../services/fauna";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { mask, unMask } from 'remask';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";


import Email from "next-auth/providers/email";
import { api } from "../../services/api";



const schema = yup.object({
  company: yup.string().required(),
  document: yup.string().matches(/(^\d{3}\.\d{3}\.\d{3}\-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$)/, { excludeEmptyString: false }),
  email:yup.string().email().required(),
}).required();



type formsType = {
  document:string;
  company: string;
  email:string; 
  dateCreated:Date;
}

export default function ModalCompanyRegister({ onClose = () => { }}) {
  const {register,reset,handleSubmit,formState: { errors }} = useForm<formsType>({
    resolver: yupResolver(schema)
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formError, setFormError] = useState(false);
  



  

 async function onSubmit(userSubmit: formsType) {
   console.log(userSubmit);
   let userPost = {
     document: userSubmit.document.replace(/\D/g, ""),
     company: userSubmit.company,
     email: userSubmit.email.toLowerCase(),
     dateCreated: new Date()
   };

   try{

    const response = await api.post('api/subscribe',{
      ...userPost
    })

console.log(response);
     alert(response)

    }
    catch (err:any)
    {
     alert("Error: " + err.message);
    }

 }





  
   
  const onError = (errors, e) => {
    setFormError(errors != {} ? true : false)
    console.log(errors, e);
  
  
  
  
  }
 
  
  return (
    <>
    
        <div className="z-10 p-4 ml-2 bg-gray-800 rounded-lg w-96">
          <form onSubmit={handleSubmit(onSubmit, onError)} className="grid grid-cols-2 gap-1">
            <div className="relative w-full mb-3 ">
              <label
                className="block mb-2 text-xs font-bold text-white uppercase"
               
              >
                Empresa
              </label>
              <input
                type="text"
                className="w-full px-3 py-3 text-sm transition-all duration-150 ease-linear bg-gray-700 border-0 rounded shadow placeholder-blueGray-300 text-slate-200 focus:outline-none focus:ring"
                placeholder="Nome"
                {...register("company")}
              />
              
            </div>
            <div className="relative w-full mb-3 ">
              <label
                className="block mb-2 text-xs font-bold text-white uppercase"
                
              >
                CNPJ ou CPF
              </label>
              <input
                type="text"
                className="w-full px-3 py-3 text-sm transition-all duration-150 ease-linear bg-gray-700 border-0 rounded shadow placeholder-blueGray-300 text-slate-200 focus:outline-none focus:ring"
                placeholder=" CNPJ ou CPF"
                {...register("document", {
                  onChange: (e) => {
                    const OriginalValue = unMask(e.target.value);
                    const MaskValue = mask(OriginalValue,
                      ["999.999.999-99", "99.999.999/9999-99"])
                    reset({ document: MaskValue })
                  }
                }
                
              )}
              />
           
            </div>

            <div className="relative w-full mb-3">
              <label
                className="block mb-2 text-xs font-bold text-white uppercase"
               
              >
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-3 text-sm transition-all duration-150 ease-linear bg-gray-700 border-0 rounded shadow placeholder-blueGray-300 text-slate-200 focus:outline-none focus:ring"
                placeholder="Email"
                {...register("email")}
              />
             
            </div>

          

            <div>
              <label className="flex flex-col w-full mt-4 cursor-point">
                <span className="h-5 ml-2 text-sm font-semibold text-slate-200">
                  <span className="text-slate-300">
                    {formError ? "corrija os dados" : null } 
                   
                    
                  </span>
                </span>



                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white uppercase transition-all duration-150 ease-linear bg-gray-600 rounded shadow outline-none active:bg-lightBlue-600 hover:shadow-md focus:outline-none "
                >
                  Salvar
                </button>
              </label>
            </div>

           
          </form>
        </div>
      
    </>
  );
}
