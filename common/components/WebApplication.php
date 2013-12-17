<?php

/**
 * WebApplication.php
 */
class WebApplication extends CWebApplication {

    /**
     * This function is here because we aren't creating a locale file for every client.
     * Thus we provide a fallback to "en".
     */
    public function getLocale($localeID = null) {
        try {
            return parent::getLocale($localeID);
        } catch (Exception $e) {
            return CLocale::getInstance('en');
        }
    }
}
