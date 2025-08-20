<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Читаем конфигурацию Supabase из файла .env
$envFile = '/var/www/vsmenucl29.ru/menuCL29/.env.local';
$supabaseUrl = '';
$supabaseKey = '';

if (file_exists($envFile)) {
    $envContent = file_get_contents($envFile);
    $lines = explode("\n", $envContent);
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (strpos($line, 'REACT_APP_SUPABASE_URL=') === 0) {
            $supabaseUrl = substr($line, strlen('REACT_APP_SUPABASE_URL='));
        }
        if (strpos($line, 'REACT_APP_SUPABASE_ANON_KEY=') === 0) {
            $supabaseKey = substr($line, strlen('REACT_APP_SUPABASE_ANON_KEY='));
        }
    }
}

if (!$supabaseUrl || !$supabaseKey) {
    http_response_code(500);
    echo json_encode(['error' => 'Supabase configuration not found']);
    exit;
}

// Функция для запроса к Supabase
function supabaseRequest($endpoint, $method = 'GET', $data = null) {
    global $supabaseUrl, $supabaseKey;
    
    $url = $supabaseUrl . '/rest/v1/' . $endpoint;
    
    $headers = [
        'apikey: ' . $supabaseKey,
        'Authorization: Bearer ' . $supabaseKey,
        'Content-Type: application/json',
        'Prefer: return=representation'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'data' => json_decode($response, true)
    ];
}

// Обработка запросов
$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['path'] ?? '';

try {
    switch ($method) {
        case 'GET':
            if ($path === 'menu') {
                // Получаем все данные меню
                $restaurant = supabaseRequest('restaurant?select=*');
                $categories = supabaseRequest('categories?select=*&order=order_index');
                $subCategories = supabaseRequest('sub_categories?select=*&order=order_index');
                $items = supabaseRequest('items?select=*&order=created_at');
                
                if ($restaurant['status'] === 200 && $categories['status'] === 200 && 
                    $subCategories['status'] === 200 && $items['status'] === 200) {
                    
                    // Формируем структуру меню
                    $menu = [
                        'restaurant' => $restaurant['data'][0] ?? null,
                        'categories' => []
                    ];
                    
                    foreach ($categories['data'] as $cat) {
                        $category = [
                            'id' => $cat['id'],
                            'name' => $cat['name'],
                            'icon' => $cat['icon'],
                            'orderIndex' => $cat['order_index'],
                            'subCategories' => []
                        ];
                        
                        foreach ($subCategories['data'] as $sub) {
                            if ($sub['category_id'] == $cat['id']) {
                                $subCategory = [
                                    'id' => $sub['id'],
                                    'name' => $sub['name'],
                                    'categoryId' => $sub['category_id'],
                                    'orderIndex' => $sub['order_index'],
                                    'items' => []
                                ];
                                
                                foreach ($items['data'] as $item) {
                                    if ($item['sub_category_id'] == $sub['id']) {
                                        $subCategory['items'][] = [
                                            'id' => $item['id'],
                                            'name' => $item['name'],
                                            'description' => $item['description'],
                                            'price' => $item['price'],
                                            'category' => $cat['id'],
                                            'subCategory' => $sub['id'],
                                            'available' => $item['available'],
                                            'imageUrl' => $item['image_url'],
                                            'image' => $item['image_url']
                                        ];
                                    }
                                }
                                
                                $category['subCategories'][] = $subCategory;
                            }
                        }
                        
                        $menu['categories'][] = $category;
                    }
                    
                    echo json_encode($menu);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Failed to fetch data from Supabase']);
                }
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint not found']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
?>
