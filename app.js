// 1. إعدادات الاتصال بقاعدة البيانات Supabase بالترتيب الصحيح
const SUPABASE_URL = 'https://dptincirgzfwrlrpxajl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DbYCExpNFypVQARATbdeVw_hipYS1Oa';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. دالة جلب وعرض تفاصيل المنتج الديناميكية
async function fetchProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const container = document.getElementById('product-details');

    if (!container) return; // إذا لم نكن في صفحة المنتج، تخطي التنفيذ

    if (!productId) {
        container.innerHTML = '<p style="text-align:center; color:red;">عذراً، لم يتم تحديد المنتج المطلوب.</p>';
        return;
    }

    try {
        let { data: product, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error || !product) {
            container.innerHTML = '<p style="text-align:center; color:red;">لم يتم العثور على هذا المنتج.</p>';
            return;
        }

        container.innerHTML = `
            <div class="product-section" style="display: flex; flex-wrap: wrap; gap: 40px; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-top: 30px;">
                <div class="product-image-container" style="flex: 1; min-width: 300px;">
                    <img src="${product.image_url || 'placeholder.jpg'}" alt="${product.name}" style="width: 100%; border-radius: 8px; object-fit: cover;">
                </div>
                <div class="product-info-container" style="flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 20px;">
                    <h1 class="product-title" style="font-size: 28px; color: #2c3e50; margin: 0;">${product.name}</h1>
                    <div class="product-price" style="font-size: 24px; color: #e74c3c; font-weight: bold;">${product.price} دينار</div>
                    <div class="product-description" style="font-size: 16px; color: #666; line-height: 1.6;">${product.description || 'لا يوجد وصف متاح لهذا المنتج حالياً.'}</div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})" style="background: #27ae60; color: white; border: none; padding: 12px 25px; font-size: 18px; border-radius: 6px; cursor: pointer; width: fit-content;">أضف إلى السلة 🛍️</button>
                </div>
            </div>
        `;
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="text-align:center; color:red;">حدث خطأ أثناء تحميل المنتج.</p>';
    }
}

function addToCart(productId) {
    alert('تم إضافة المنتج إلى السلة بنجاح!');
}

// تشغيل الدالة تلقائياً عند تحميل صفحة المنتج
window.onload = fetchProductDetails;