import React from 'react';
import useravatar from './useravatar.png';

export const UserAvatar = React.memo(({ name = 'User', size = 40 }) => {
  return (
    <div className="user-avatar-shell" style={{ width: size, height: size }}>
      <img src={useravatar} alt={name} className="user-avatar-image" />
    </div>
  );
});

UserAvatar.displayName = 'UserAvatar';
