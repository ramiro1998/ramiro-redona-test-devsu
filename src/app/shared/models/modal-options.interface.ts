export interface ModalButton {
    label: string;
    role: 'confirm' | 'cancel' | 'action';
    styleClass: string;
}

export interface GenericModalData {
    message: string;
    title?: string;
    buttons: ModalButton[];
}