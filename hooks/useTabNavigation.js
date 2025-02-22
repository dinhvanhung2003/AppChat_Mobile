// hooks/useTabNavigation.js
import { useNavigation } from '@react-navigation/native';

const useTabNavigation = () => {
  const navigation = useNavigation();

  const handleTabPress = (tab) => {
    switch (tab) {
      case 'Messages':
        navigation.navigate('MessageScreen');
        break;
      case 'Contacts':
        navigation.navigate('PhoneBook');
        break;
      case 'News':
        navigation.navigate('NewScreen');
        break;
      case 'Notifications':
        navigation.navigate('ExploreScreen');
        break;
      case 'Account':
        navigation.navigate('ProfileScreen');
        break;
      default:
        break;
    }
  };

  return handleTabPress;
};

export default useTabNavigation;
