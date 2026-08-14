import { create } from "zustand";

// type para os dados do usuário
type States = {
    name: string;
    address: {
        street: string
        number: string
        complement?: string | undefined
        district: string
        city: string
        state: string 
    }
}

// type para registrar esses dados
type Actions = {
    setName: (name: States["name"]) => void
    setAddress: (address: States["address"]) => void
}

// dados iniciais
const initialState: States = {
    name: '',
    address: {
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: ''
    }
}

// implementando de fato as funcionalidades para quem chamar este hook.
export const useCheckoutStore = create<States & Actions>()(set => ({
    ...initialState,
    setName: (name) => set(state => ({ ...state, name })),
    setAddress: (address) => set(state => ({ ...state, address }))
}))