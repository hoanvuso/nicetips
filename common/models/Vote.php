<?php
class Vote extends CFormModel{
    public static function findAll($placeId, $limit = NULL, $offset = NULL){
        $parseQuery = new parseQuery('Vote');

        return $parseQuery->find();
    }
}