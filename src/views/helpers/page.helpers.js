
export function setTitle(title) {
    this.pageTitle = title;
}

export function isActive(currentPage, page) {
    return currentPage === page ? 'active' : '';
}

export function isAdminProfile(role) {
    return role === 'admin';
}