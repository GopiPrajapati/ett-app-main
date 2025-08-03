import images from '../assets/images';

export const profileMenu = [
  {
    title: 'Payments',
    options: [
      {
        title: 'Shopping Transactions',
        type: 'shopping_transactions',
        menuType: 'chevron-right',
        source: images.ic_history,
      },
      {
        title: 'Receipts',
        type: 'receipts',
        menuType: 'chevron-right',
        source: images.ic_receipt,
      },
    ],
  },
  {
    title: 'Manage',
    options: [
      {
        title: 'Favourites',
        type: 'favourites',
        menuType: 'chevron-right',
        source: images.ic_heart,
      },
      {
        title: 'Account Settings',
        type: 'account_settings',
        menuType: 'chevron-right',
        source: images.ic_user_search,
      },
      {
        title: 'Notification Settings',
        type: 'notification_settings',
        menuType: 'chevron-right',
        source: images.ic_notification_bing,
      },
      {
        title: 'Dark Mode',
        type: 'dark_mode',
        menuType: 'switch',
        source: images.ic_theme,
      },
    ],
  },
  {
    title: 'Support',
    options: [
      {
        title: 'Help Center',
        type: 'help_center',
        menuType: 'chevron-right',
        source: images.ic_help,
      },
      {
        title: 'Share Feedback',
        type: 'share_feedback',
        menuType: 'chevron-right',
        source: images.ic_feedback,
      },
    ],
  },
  {
    title: 'More',
    options: [
      {
        title: 'About Us',
        type: 'about_us',
        menuType: 'chevron-right',
        source: images.ic_explore,
      },
      {
        title: 'Logout',
        type: 'logout',
        menuType: '',
        source: images.ic_logout,
        color: '#FF0000',
      },
    ],
  },
];

export const notificationSettings = [
  {
    options: [
      {
        title: 'Enable all',
        type: 'enable_all',
        menuType: 'switch',
      },
      {
        title: 'Promos and offers',
        type: 'promos_and_offers',
        menuType: 'switch',
      },
      {
        title: 'Product alert',
        type: 'product_alert',
        menuType: 'switch',
      },
    ],
  },
];

export const accountSettings = [
  {
    options: [
      {
        title: 'Provide phone number access to business',
        type: 'provide_phone_number_access_to_business',
        menuType: 'switch',
      },
      {
        title: 'Preferences',
        type: 'preferences',
        menuType: 'chevron-right',
        source: images.ic_category,
      },
      {
        title: 'Delete Account',
        type: 'delete_account',
        source: images.ic_delete,
        color: '#ff0000',
      },
    ],
  },
];

export const aboutUs = [
  {
    options: [
      {
        title: 'Terms and Conditions',
        type: 'terms_and_conditions',
        menuType: 'chevron-right',
        source: images.ic_document,
      },
      {
        title: 'Privacy Policy',
        type: 'privacy_policy',
        menuType: 'chevron-right',
        source: images.ic_document,
      },
    ],
  },
];

export const sorts = {
  DESC: 'DESC',
  ASC: 'ASC',
};
