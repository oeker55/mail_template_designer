<%@ Language="VBScript" CodePage="65001" %>
<%
Response.CodePage = 65001
Response.CharSet = "UTF-8"

' Firma kodları - bu değerler sizin sisteminizden gelecek
Dim scode, fcode
scode = Request.QueryString("scode")
fcode = Request.QueryString("fcode")
If scode = "" Then scode = "LOCAL_MAGAZA"
If fcode = "" Then fcode = "LOCAL_FIRMA"
apiUrl = "http://localhost:5000/api"
%>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template Designer</title>
    
    <!-- Build edilen CSS dosyası -->
    <link rel="stylesheet" href="/email-designer/assets/index-DC7351UO.css">
    
    <style>
        /* Sayfa yüklenirken gösterilecek loading */
        .page-loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 16px;
            z-index: 9999;
        }
        .page-loading.hidden {
            display: none;
        }
        .page-loading .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e0e0e0;
            border-top-color: #3a416f;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <!-- Loading ekranı -->
    <div id="pageLoading" class="page-loading">
        <div class="spinner"></div>
        <p>Email Template Designer yükleniyor...</p>
    </div>

    <!-- React uygulaması buraya mount edilecek -->
    <div id="root"></div>

    <!-- ASP'den React'e aktarılacak ayarlar -->
    <script>
        // Bu değerler ASP tarafından set ediliyor
        window.emailSettings = {
            scode: '<%=scode%>',
            fcode: '<%=fcode%>',
            apiUrl: '<%=apiUrl%>'
        };
        
        // Debug için console'a yazdır
        console.log('Email Settings:', window.emailSettings);
    </script>

    <!-- Build edilen JS dosyaları -->
    <script type="module" crossorigin src="/email-designer/assets/index-CPVzGejp.js"></script>
    
    <script>
        // Sayfa yüklendiğinde loading'i gizle
        window.addEventListener('load', function() {
            setTimeout(function() {
                document.getElementById('pageLoading').classList.add('hidden');
            }, 500);
        });
    </script>
</body>
</html>
