<?php
class CommonHelper{
    /**
     * create qr code from string data
     * @return string url to qr code image
     */
    public static function generateQRCode($str, $width = 300, $height = 300){
        $request = http_build_query(array(
            'chs' => "{$width}x{$height}",
            'cht' => 'qr',
            'chl' => $str,
            'choe' => 'UTF-8'
        ));

        return 'https://chart.googleapis.com/chart?'.$request;
    }
}