import { createContext, useContext } from 'react'

const PaymentContext = createContext(null);

export function usePaymentConfirm() {
  return useContext(PaymentContext)
}

var payment = false;

export function getPayment(data) {
  payment = data;
}

export function PaymentProvider({children}) {
  return <PaymentContext.Provider value={payment}>{children}</PaymentContext.Provider>;
}