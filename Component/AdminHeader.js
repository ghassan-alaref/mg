import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation  } from 'react-router-dom';
import LogoutIcon from '../Images/mdi_logout.png';
import BellIcon from '../Images/notification.png';
import { useCustomerOptions } from '../Context/CustomerOptionsContext';
import { useAdminNewCustomerContext } from '../Context/AdminNewCustomerContext';
import { useCookies } from 'react-cookie';

const Header  = ({ onNotificationsClick }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const location = useLocation();
  const username = location.state?.username || '';
  const { logoutCustomerOptions } = useCustomerOptions();
  const { logoutAdminNewCustomer } = useAdminNewCustomerContext();
const adminuserName = cookies.token?.username || "";
  const logout = () => {
    // Remove authentication tokens from both localStorage and sessionStorage
    localStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('isAuthenticated');
    logoutCustomerOptions()
    logoutAdminNewCustomer()
    // Navigate to the login page
    navigate('/');
  };

  const flipImageStyle = i18n.language === 'ar' ? { transform: 'scaleX(-1)' } : {};
  return (
    <div className="flex-1 flex flex-col" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
 <header className={`flex  justify-between items-center p-3 px-0 md:px-14 xl:px-10 mt-5 gap-3 md:gap-0 ${i18n.language === 'ar' ? 'ml-7 md:ml-0' : 'mr-7 md:mr-0'}`}>

 <span className={`text-sm md:text-xl font-semibold ${i18n.language === 'ar' ? 'mr-5 md:ml-0' : 'ml-5 md:mr-0'}`}>
          {t('hello')} {adminuserName} 👋
        </span>
        <div className={`${i18n.language === 'ar' ? 'ml-0 md:ml-16 xl:ml-8' : 'mr-0 md:mr-28 xl:mr-8'} flex  items-center gap-5 `}>
      <button className="flex items-center cursor-pointer text-xs sm:text-sm" onClick={logout}>
           <img src={LogoutIcon} alt={t('logout')} className="md:h-auto md:w-5 h-auto w-4" style={flipImageStyle} />
           <span className={`${i18n.language === 'ar' ? 'mr-2' : 'ml-2'} text-xs sm:text-sm`}>{t('logout')}</span>

          </button>
         

        </div>
      </header>
    </div>
  );
};

export default Header;
