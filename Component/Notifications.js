import React, { useState } from 'react';
import enUS from 'antd/lib/locale/en_US';
import arEG from 'antd/lib/locale/ar_EG';
import { useTranslation } from 'react-i18next';
import ArrowIcon from '../Images/left.png'; 



const notifications = [
  { messageKey: 'approvedMessage', time: '1h' },
  { messageKey: 'rejectedMessage', time: '2h' },
  { messageKey: 'activatedMessage', time: '1d' },
  { messageKey: 'rejectedMessage', time: '1d' },
  { messageKey: 'approvedMessage', time: '2d' },
  { messageKey: 'activatedMessage', time: '2d' },
  { messageKey: 'activatedMessage', time: '3d' }
];


const NotificationItem = ({ messageKey, time, onClick  }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const locale = i18n.language === 'ar' ? arEG : enUS;
  return (
    <div className="flex justify-between items-start p-4 border-b border-gray-200 last:border-0 cursor-pointer" onClick={onClick}>
      <div className="flex-1">
        <p className="text-sm text-gray-800">{t(messageKey)}</p>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  );
};

const Notifications = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const locale = i18n.language === 'ar' ? arEG : enUS;
  const [selectedNotificationIndex, setSelectedNotificationIndex] = useState(null);
  
  const handleNotificationClick = (index) => {
    setSelectedNotificationIndex(index);
  };

  const handleBackClick = () => {
    setSelectedNotificationIndex(null);
  };

  const renderNotificationDetails = (notification) => {
    return (
      <>
        <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} className="flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer">
          <h2 className="text-xl font-semibold mb-4">{t('notificationsTitle')}</h2>
          <img src={ArrowIcon} alt="Back"  className={`h-5 w-3 md:h-auto w-6 ${!isArabic ? 'transform rotate-180' : ''}`}  onClick={handleBackClick}/>
        </div>
        <div className="flex flex-row justify-between p-4 ">
          <p>{t(notification.messageKey)}</p>
          <span>{notification.time}</span>
        </div>
      </>
    );
  };

  return (
    
      <div className={`bg-[#FAFAFF]  min-h-screen flex ${i18n.dir() === 'rtl' ? 'flex-row-reverse' : ''}`}>
        
        <div className="flex-1 flex flex-col">
          
          <main 
          dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
          className="md:bg-white   p-4 sm:m-5 sm:p-5  md:m-10 xl:m-12 mt-5 rounded-xl w-[23rem] md:w-5/6 xl:w-11/12 "style={{ height: '100%' }}>
           {selectedNotificationIndex === null ? (
          <>
            <div className="flex flex-row justify-between items-start mx-3  border-b border-gray-200 last:border-0">
<h2 className="text-xl font-semibold mb-4 ">{t('notificationsTitle')}</h2>
{/* <img src={SearchIcon} alt="Search" className={`h-5 w-5  text-gray-400 ${isArabic ? 'ml-4 md:ml-5' : 'ml-4 md:ml-10'}`} /> */}
</div>
      <div className="space-y-2 mt-4 mx-3">
        <h3 className="text-gray-600 font-medium ">{t('new')}</h3>
        {notifications.slice(0, 2).map((notification, index) => (
          <NotificationItem key={index} {...notification}  onClick={() => handleNotificationClick(index)}/>
        ))}
      </div>
      <div className="mt-4 space-y-2 mx-3">
        <h3 className="text-gray-600 font-medium">{t('earlier')}</h3>
        {notifications.slice(2).map((notification, index) => (
          <NotificationItem key={index} {...notification} onClick={() => handleNotificationClick(index)}/>
        ))}
      </div>
      </>
        ) : (
          renderNotificationDetails(notifications[selectedNotificationIndex])
        )}
        </main>
       
      </div>
    </div>
    
  );
};

export default Notifications;
