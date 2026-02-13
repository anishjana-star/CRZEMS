import Swal from 'sweetalert2';

export const showAlert = (title, text, icon = 'info') => {
    return Swal.fire({
        title,
        text,
        icon,
        confirmButtonColor: '#3085d6',
    });
};

export const showSuccess = (title, text) => {
    return Swal.fire({
        title,
        text,
        icon: 'success',
        confirmButtonColor: '#3085d6',
    });
};

export const showError = (title, text) => {
    return Swal.fire({
        title,
        text,
        icon: 'error',
        confirmButtonColor: '#d33',
    });
};

export const showConfirm = async (title, text, icon = 'warning', confirmButtonText = 'Yes, perform action') => {
    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText
    });
    return result.isConfirmed;
};

export const showToast = (title, icon = 'success') => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    return Toast.fire({
        icon,
        title
    });
};
