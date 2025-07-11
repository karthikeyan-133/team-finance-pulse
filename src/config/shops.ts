
export interface Shop {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
  accessCode?: string;
}

export const SHOPS: Shop[] = [
  {
    id: 'shop-1',
    name: 'Al Ameen',
    isActive: true,
    accessCode: 'F121BKSL13'
  },
  {
    id: 'shop-2',
    name: 'Al Cafe',
    isActive: true,
    accessCode: 'F122BKSL13'
  },
  {
    id: 'shop-3',
    name: 'AMR',
    isActive: true,
    accessCode: 'F123BKSL13'
  },
  {
    id: 'shop-4',
    name: 'Fish Shop',
    isActive: true,
    accessCode: 'F124BKSL13'
  },
  {
    id: 'shop-5',
    name: 'Food Dude',
    isActive: true,
    accessCode: 'F125BKSL13'
  },
  {
    id: 'shop-6',
    name: 'Haritham Vegetables',
    isActive: true,
    accessCode: 'F126BKSL13'
  },
  {
    id: 'shop-7',
    name: 'KL 70',
    isActive: true,
    accessCode: 'F127BKSL13'
  },
  {
    id: 'shop-8',
    name: 'Malabar Green',
    isActive: true,
    accessCode: 'F128BKSL13'
  },
  {
    id: 'shop-9',
    name: 'Metro Bakery',
    isActive: true,
    accessCode: 'F129BKSL13'
  },
  {
    id: 'shop-10',
    name: 'Milko',
    isActive: true,
    accessCode: 'F130BKSL13'
  },
  {
    id: 'shop-11',
    name: 'Moon Star',
    isActive: true,
    accessCode: 'F131BKSL13'
  },
  {
    id: 'shop-12',
    name: 'Muji Biriyani',
    isActive: true,
    accessCode: 'F132BKSL13'
  },
  {
    id: 'shop-13',
    name: 'Nazar',
    isActive: true,
    accessCode: 'F133BKSL13'
  },
  {
    id: 'shop-14',
    name: 'Thejus Bakery',
    isActive: true,
    accessCode: 'F134BKSL13'
  },
  {
    id: 'shop-15',
    name: 'Zyra',
    isActive: true,
    accessCode: 'F135BKSL13'
  },
  
  
];

export const getActiveShops = (): Shop[] => {
  return SHOPS.filter(shop => shop.isActive);
};

export const getShopById = (id: string): Shop | undefined => {
  return SHOPS.find(shop => shop.id === id);
};
