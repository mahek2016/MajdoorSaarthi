export function isProfileComplete(user) {
  if (!user.role) return false;
  if (user.role === 'WORKER') {
    return !!(
      user.worker &&
      user.worker.location &&
      user.worker.experience > 0 &&
      user.worker.expectedWage > 0
    );
  }
  if (user.role === 'CONTRACTOR') {
    return !!(user.contractor && user.contractor.businessName);
  }
  if (user.role === 'COMPANY') {
    return !!(user.company && user.company.companyName);
  }
  return false;
}

export function formatUserResponse(user) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    profilePhoto: user.profilePhoto,
    profileComplete: isProfileComplete(user),
  };
}
