// Mock Data for Development
const MOCK_CATEGORIES = [
    {
        id: '1',
        name: 'ملابس رجالية',
        image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop'
    },
    {
        id: '2',
        name: 'ملابس نسائية',
        image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop'
    },
    {
        id: '3',
        name: 'أحذية',
        image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=400&fit=crop'
    },
    {
        id: '4',
        name: 'إكسسوارات',
        image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop'
    },
    {
        id: '5',
        name: 'حقائب',
        image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=400&fit=crop'
    },
    {
        id: '6',
        name: 'ساعات',
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop'
    }
];

const MOCK_PRODUCTS = [
    {
        id: '1',
        name: 'قميص رجالي كلاسيكي',
        code: 'M-SHIRT-001',
        price: 89.99,
        image_url: 'https://images.unsplash.com/photo-1594938291221-94f313e0a43e?w=600&h=800&fit=crop',
        description: 'قميص رجالي أنيق من القطن عالي الجودة، مناسب للارتداء اليومي والمناسبات الرسمية.',
        category_id: '1',
        stock: 50
    },
    {
        id: '2',
        name: 'فستان نسائي أنيق',
        code: 'W-DRESS-001',
        price: 149.99,
        image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop',
        description: 'فستان نسائي عصري بتصميم أنيق، مثالي للمناسبات والاحتفالات.',
        category_id: '2',
        stock: 30
    },
    {
        id: '3',
        name: 'جينز رجالي',
        code: 'M-JEANS-001',
        price: 119.99,
        image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop',
        description: 'بنطلون جينز رجالي مريح وعصري، مصنوع من أجود أنواع القماش.',
        category_id: '1',
        stock: 45
    },
    {
        id: '4',
        name: 'حذاء رياضي',
        code: 'SNEAKERS-001',
        price: 199.99,
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop',
        description: 'حذاء رياضي مريح وأنيق، مناسب للرياضة والاستخدام اليومي.',
        category_id: '3',
        stock: 25
    },
    {
        id: '5',
        name: 'ساعة يد فاخرة',
        code: 'WATCH-001',
        price: 299.99,
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop',
        description: 'ساعة يد فاخرة بتصميم كلاسيكي أنيق، مناسبة للرجال والنساء.',
        category_id: '6',
        stock: 15
    },
    {
        id: '6',
        name: 'حقيبة يد نسائية',
        code: 'BAG-001',
        price: 179.99,
        image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=800&fit=crop',
        description: 'حقيبة يد نسائية أنيقة وعملية، مصنوعة من الجلد الطبيعي.',
        category_id: '5',
        stock: 20
    },
    {
        id: '7',
        name: 'قميص نسائي',
        code: 'W-SHIRT-001',
        price: 79.99,
        image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop',
        description: 'قميص نسائي مريح وأنيق، مناسب للارتداء اليومي.',
        category_id: '2',
        stock: 40
    },
    {
        id: '8',
        name: 'نظارة شمسية',
        code: 'SUNGLASSES-001',
        price: 129.99,
        image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=800&fit=crop',
        description: 'نظارة شمسية عصرية بتصميم أنيق، تحمي من أشعة الشمس الضارة.',
        category_id: '4',
        stock: 35
    },
    {
        id: '9',
        name: 'جاكيت رياضي',
        code: 'JACKET-001',
        price: 159.99,
        image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop',
        description: 'جاكيت رياضي مريح وأنيق، مناسب للرياضة والاستخدام اليومي.',
        category_id: '1',
        stock: 28
    },
    {
        id: '10',
        name: 'تنورة نسائية',
        code: 'W-SKIRT-001',
        price: 99.99,
        image_url: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&h=800&fit=crop',
        description: 'تنورة نسائية أنيقة وعصرية، مناسبة للمناسبات والاحتفالات.',
        category_id: '2',
        stock: 32
    },
    {
        id: '11',
        name: 'حذاء كاجوال',
        code: 'SHOES-001',
        price: 139.99,
        image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=800&fit=crop',
        description: 'حذاء كاجوال مريح وأنيق، مناسب للاستخدام اليومي.',
        category_id: '3',
        stock: 22
    },
    {
        id: '12',
        name: 'سلسال ذهبي',
        code: 'NECKLACE-001',
        price: 249.99,
        image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop',
        description: 'سلسال ذهبي فاخر بتصميم أنيق، مثالي للهدايا والمناسبات.',
        category_id: '4',
        stock: 18
    }
];

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MOCK_CATEGORIES, MOCK_PRODUCTS };
}

