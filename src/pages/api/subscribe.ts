import { NextApiRequest, NextApiResponse } from "next";
import { IsNull, query as q } from "faunadb";
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";
import { getSession } from "next-auth/react";
import { authOptions } from "./auth/[...nextauth]";
import { unstable_getServerSession } from "next-auth";

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};



interface userFaunaType {
  ref: {
    id: string;
  };
  data: {
    id: string;
    name: string;
    email: string;
    image: string;
    stripe_customer_id: string;
  };
}



type postType = {

  document:string;
  company: string;
  email:string; 
}


/* eslint import/no-anonymous-default-export: [2, {"allowArrowFunction": true}] */
export default async (request: NextApiRequest, response: NextApiResponse) => {


  if (request.method === "POST") {
 
   const requestSubscribe:postType=request.body;
   console.log(requestSubscribe)
  


  
    
try {
     
  
     await fauna
       .query(
         q.If(
           q.Not(
             q.Exists(
               q.Match(
                 q.Index("user_by_email"),
                 q.Casefold(requestSubscribe.email)
               )
             )
           ),
           q.Create(q.Collection("users"), {
             data: {
               email: requestSubscribe.email,
             },
           }),
           "usuario ja cadastrado"
         )
       )
       .then((ret) => console.log(ret))
       .catch((err) =>
         console.error(
           "Error: [%s] %s: %s",
           err.name,
           err.message,
           err.errors()[0].description
         )
       );

   
  
       await fauna
       .query(
         q.If(
           q.Not(
             q.Exists(
               q.Match(
                 q.Index("company_by_document"),
                 q.Casefold(requestSubscribe.document)
               )
             )
           ),
           q.Create(q.Collection("companies"), {
             data: {
               informations: {
                 name: requestSubscribe.company,
                 document: requestSubscribe.document,
                 email: requestSubscribe.email,
               },
             },
           }),
           "empresa ja cadastrada"
         )
       )
       .then((ret) => console.log(ret))
       .catch((err) =>
         console.error(
           "Error: [%s] %s: %s",
           err.name,
           err.message,
           err.errors()[0].description
         )
       );
 


       let userFaunaDB = await fauna.query(
        q.Get(q.Match(q.Index("user_by_email"), requestSubscribe.email))
      );
      let companyFaunaDB = await fauna.query(
        q.Get(q.Match(q.Index("company_by_document"), requestSubscribe.document))
      );
    
    
    
      await fauna
          .query(
            q.If(
              q.Not(
                q.Exists(
                  q.Match(
                    q.Index("subscriptions_by_companyRef"),
                    q.Casefold(companyFaunaDB.ref)
                  )
                )
              ),
              q.Create(q.Collection("subscriptions"), {
                data: {
                  companyRef:companyFaunaDB.ref,
                  userRef:userFaunaDB.ref
                },
              }),
            "Empresa já Cadastrada"
            )
          )
          .then((ret) => console.log(ret))
          .catch((err) =>
            console.error(
              "Error: [%s] %s: %s",
              err.name,
              err.message,
              err.errors()[0].description
            )
          );
    
    





       return true;
      } catch {
        return false;
      }


  









   response.status(200).end("Conta criada");
  } else {
    response.setHeader("Allow", "POST");
    response.status(405).end("Method not allowed");
  }
};
