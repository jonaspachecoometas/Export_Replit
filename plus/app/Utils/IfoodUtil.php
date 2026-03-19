<?php

namespace App\Utils;

class IfoodUtil{

	public function getUserCode($config){
		$url = "https://merchant-api.ifood.com.br/authentication/v1.0/oauth/userCode";

		$curl = curl_init();

		$headers = [];
		curl_setopt($curl, CURLOPT_URL, $url . "?clientId=".$config->clientId);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true );
		curl_setopt($curl, CURLOPT_HEADER, false);
		$result = json_decode(curl_exec($curl));
		curl_close($curl);

		if(isset($result->authorizationCodeVerifier)){
			$authorizationCodeVerifier = $result->authorizationCodeVerifier;
			$verificationUrlComplete = $result->verificationUrlComplete;
			$userCode = $result->userCode;

			if($userCode){
				$item = $config;
				$item->userCode = $userCode;
				$item->authorizationCodeVerifier = $authorizationCodeVerifier;
				$item->verificationUrlComplete = $verificationUrlComplete;
				$item->save();
				return $userCode;
			}
			return "";
		}else{
			echo "Algo errado, retorno iFood: ";
			print_r($result);
			die;
		}
	}

	public function oAuthToken($config){
		$url = "https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token";

		$ch = curl_init();
		$grantType = $config->grantType;

		if($config->accessToken != ""){
			$grantType = 'refresh_token';
		}

		$clientId = $config->clientId;
		$clientSecret = $config->clientSecret;
		$authorizationCode = $config->authorizationCode;
		$authorizationCodeVerifier = $config->authorizationCodeVerifier;

		$params = "?grantType=$grantType&clientId=$clientId&clientSecret=$clientSecret&authorizationCode=$authorizationCode&authorizationCodeVerifier=$authorizationCodeVerifier";

		if($config->accessToken != ""){
			$params .= "&refreshToken=" . $config->refreshToken;
		}
		$headers = [];
		curl_setopt($ch, CURLOPT_URL, $url . $params);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_ENCODING, '');
		$result = json_decode(curl_exec($ch));
		curl_close($ch);
		if(!isset($result->error)){

			$accessToken = $result->accessToken;
			$refreshToken = $result->refreshToken;
			$item = $config;
			$item->accessToken = $result->accessToken;
			$item->refreshToken = $result->refreshToken;

			$item->save();
			return ['success' => 1, 'token' => $accessToken];
		}else{
			$item = $config;
			$item->save();
			return ['success' => 0, 'message' => $result->error->message];

		}

	}

	public function newToken($config){
		$url = "https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token";

		$ch = curl_init();
		$grantType = $config->grantType;

		$clientId = $config->clientId;
		$clientSecret = $config->clientSecret;
		$authorizationCode = $config->authorizationCode;
		$authorizationCodeVerifier = $config->authorizationCodeVerifier;

		// $params = "?grantType=$grantType&clientId=$clientId&clientSecret=$clientSecret&authorizationCode=$authorizationCode&authorizationCodeVerifier=$authorizationCodeVerifier";
		$params = "?grantType=$grantType&clientId=$clientId&clientSecret=$clientSecret&authorizationCode=$authorizationCode&authorizationCodeVerifier=$authorizationCodeVerifier";

		$headers = [];
		curl_setopt($ch, CURLOPT_URL, $url . $params);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_ENCODING, '');
		$result = json_decode(curl_exec($ch));
		curl_close($ch);

		if(!isset($result->error)){
			$accessToken = $result->accessToken;
			$refreshToken = $result->refreshToken;
			$item = $config;
			$item->accessToken = $result->accessToken;
			$item->refreshToken = $result->refreshToken;

			$item->save();
			return ['success' => 1, 'token' => $accessToken];
		}else{
			dd($result->error);
			$item = $config;
			$item->save();
			return ['success' => 0, 'message' => $result->error->message];
		}
	}

	public function statusMerchant($config){
		$url = "https://merchant-api.ifood.com.br/merchant/v1.0/merchants/".$config->merchantUUID."/status";

		$ch = curl_init();
		$headers = [
			"Authorization: Bearer " . $config->accessToken,
		];

		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

		curl_setopt($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_ENCODING, '');
		$result = json_decode(curl_exec($ch));
		curl_close($ch);

		return $result;
	}

	public function getInterruptions($config){
		$url = "https://merchant-api.ifood.com.br/merchant/v1.0/merchants/".$config->merchantUUID."/interruptions";

		$headers = [
			'Authorization: Bearer ' . $config->accessToken,
			'Accept: application/json'
		];

		$result = $this->makeApiRequest($url, $headers);
		return json_decode($result['response']);

	}

	public function getCatalogs($config){
		$url = "https://merchant-api.ifood.com.br/catalog/v1.0/merchants/".$config->merchantUUID."/catalogs";
		$ch = curl_init();
		$headers = [
			"Authorization: Bearer " . $config->accessToken
		];

		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_ENCODING, '');
		$result = json_decode(curl_exec($ch));
		curl_close($ch);
		return $result;

	}

	public function getCategories($config){
		$url = "https://merchant-api.ifood.com.br/catalog/v1.0/merchants/".$config->merchantUUID."/catalogs/".
		$config->catalogId."/categories";

		$headers = [
			'Authorization: Bearer ' . $config->accessToken,
			'Accept: application/json'
		];

		$result = $this->makeApiRequest($url, $headers);
		return json_decode($result['response']);
	}

	public function getCategoriesV2($config) {
		$url = "https://merchant-api.ifood.com.br/catalog/v2.0/merchants/" . $config->merchantUUID . "/catalogs/" . $config->catalogId . "/categories";

		$headers = [
			'Authorization: Bearer ' . $config->accessToken,
			'Accept: application/json'
		];

		$result = $this->makeApiRequest($url, $headers);

		if ($result['http_code'] === 200) {
			return json_decode($result['response'], true);
		}
		return null;
	}

	public function getCategoryItemsV2($config, $categoryId) {
		$url = "https://merchant-api.ifood.com.br/catalog/v2.0/merchants/" . $config->merchantUUID . "/categories/" . $categoryId . "/items";

		$headers = [
			'Authorization: Bearer ' . $config->accessToken,
			'Accept: application/json'
		];

		$result = $this->makeApiRequest($url, $headers);

		if ($result['http_code'] === 200) {
			return json_decode($result['response'], true);
		}
		return null;
	}

	public function storeInterruption($config, $data){
		$url = "https://merchant-api.ifood.com.br/merchant/v1.0/merchants/".$config->merchantUUID."/interruptions";

		$headers = [
			'Authorization: Bearer ' . $config->accessToken,
			'Accept: application/json',
			'Content-Type: application/json',
		];
		$payload = json_encode($data);

		$result = $this->makeApiRequest($url, $headers, 'POST', $payload);
		return json_decode($result['response']);
	}

	public function destroyInterruption($config, $id){
		$url = "https://merchant-api.ifood.com.br/merchant/v1.0/merchants/".$config->merchantUUID."/interruptions/$id";

		$headers = [
			'Authorization: Bearer ' . $config->accessToken,
			'Accept: application/json',
			'Content-Type: application/json',
		];

		$result = $this->makeApiRequest($url, $headers, 'DELETE');
		dd($result);
		return json_decode($result['response']);
	}

	// private function makeApiRequest($url, $headers = [], $method = 'GET', $data = null) {
	// 	$ch = curl_init();
	// 	curl_setopt($ch, CURLOPT_URL, $url);
	// 	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	// 	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
	// 	curl_setopt($ch, CURLOPT_TIMEOUT, 30);
	// 	curl_setopt($ch, CURLOPT_ENCODING, '');
	// 	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

	// 	if ($method === 'POST') {
	// 		curl_setopt($ch, CURLOPT_POST, true);
	// 		if ($data) {
	// 			curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
	// 		}
	// 	}

	// 	$response = curl_exec($ch);
	// 	$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	// 	$curlError = curl_error($ch);
	// 	curl_close($ch);

	// 	return [
	// 		'response' => $response,
	// 		'http_code' => $httpCode,
	// 		'error' => $curlError
	// 	];
	// }

	private function makeApiRequest($url, $headers = [], $method = 'GET', $data = null)
	{
		$ch = curl_init();

		curl_setopt_array($ch, [
			CURLOPT_URL => $url,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_SSL_VERIFYPEER => true,
			CURLOPT_TIMEOUT => 30,
			CURLOPT_ENCODING => '',
			CURLOPT_HTTPHEADER => $headers,
		]);

		$method = strtoupper($method);

		if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

			if ($data !== null) {
				curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
			}
		}

		$response = curl_exec($ch);

		$result = [
			'response'  => $response,
			'http_code' => curl_getinfo($ch, CURLINFO_HTTP_CODE),
			'error'     => curl_error($ch),
		];

		curl_close($ch);

		return $result;
	}


	public function getProducts($config)
	{
		$url = "https://merchant-api.ifood.com.br/catalog/v2.0/merchants/". $config->merchantUUID
		. "/products?limit=200&page=1";

		$ch = curl_init();

		curl_setopt_array($ch, [
			CURLOPT_URL => $url,
			CURLOPT_HTTPHEADER => [
				"Authorization: Bearer {$config->accessToken}",
				"Content-Type: application/json"
			],
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_TIMEOUT => 30,
		]);

		$response = curl_exec($ch);

		if (curl_errno($ch)) {
			throw new \Exception(curl_error($ch));
		}

		curl_close($ch);

		return json_decode($response, true);
	}

	public function findProduct($config, $id)
	{
		$url = "https://merchant-api.ifood.com.br/catalog/v1.0/merchants/". $config->merchantUUID
		. "/product/$id";

		$ch = curl_init();

		curl_setopt_array($ch, [
			CURLOPT_URL => $url,
			CURLOPT_HTTPHEADER => [
				"Authorization: Bearer {$config->accessToken}",
				"Content-Type: application/json"
			],
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_TIMEOUT => 30,
		]);

		$response = curl_exec($ch);

		if (curl_errno($ch)) {
			throw new \Exception(curl_error($ch));
		}

		curl_close($ch);

		return json_decode($response, true);
	}


	public function storeCategory($config, $data){
		$url = "https://merchant-api.ifood.com.br/catalog/v1.0/merchants/".$config->merchantUUID."/catalogs/".
		$config->catalogId."/categories";

		$ch = curl_init();
		$headers = [
			"Authorization: Bearer " . $config->accessToken,
			'Content-Type: application/json'
		];
		$payload = json_encode($data);

		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_POST, true);

		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_ENCODING, '');
		$result = json_decode(curl_exec($ch));
		curl_close($ch);
		return $result;

	}

	public function updateCategory($config, $data, $id){
		$url = "https://merchant-api.ifood.com.br/catalog/v1.0/merchants/".$config->merchantUUID."/catalogs/".
		$config->catalogId."/categories/".$id;
		// dd($url);
		$ch = curl_init();
		$headers = [
			"Authorization: Bearer " . $config->accessToken,
			'Content-Type: application/json'
		];
		$payload = json_encode($data);

		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PATCH");

		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_ENCODING, '');
		$result = json_decode(curl_exec($ch));
		curl_close($ch);
		return $result;

	}

	public function destroyCategory($config, $id){
		$url = "https://merchant-api.ifood.com.br/catalog/v1.0/merchants/".$config->merchantUUID."/catalogs/".
		$config->catalogId."/categories/".$id;

		$ch = curl_init();
		$headers = [
			"Authorization: Bearer " . $config->accessToken,
		];

		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");

		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_ENCODING, '');
		$result = json_decode(curl_exec($ch));
		curl_close($ch);
		return $result;

	}

	// public function storeProduct($config, $data){
	// 	$url = "https://merchant-api.ifood.com.br/catalog/v1.0/merchants/".$config->merchantUUID."/products";

	// 	$ch = curl_init();
	// 	$headers = [
	// 		"Authorization: Bearer " . $config->accessToken,
	// 		'Content-Type: application/json'
	// 	];
	// 	$payload = json_encode($data);

	// 	curl_setopt($ch, CURLOPT_URL, $url);
	// 	curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
	// 	curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
	// 	curl_setopt($ch, CURLOPT_POST, true);

	// 	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	// 	curl_setopt($ch, CURLOPT_HEADER, false);
	// 	curl_setopt($ch, CURLOPT_ENCODING, '');
	// 	$result = json_decode(curl_exec($ch));
	// 	curl_close($ch);

	// 	return $result;
	// }

	public function storeProduct($config, $data){
		$url = "https://merchant-api.ifood.com.br/catalog/v1.0/merchants/".$config->merchantUUID."/products";
		$headers = [
			"Authorization: Bearer " . $config->accessToken,
			'Content-Type: application/json'
		];
		$payload = json_encode($data);

		$result = $this->makeApiRequest($url, $headers, 'POST', $payload);
		return json_decode($result['response']);

	}

	public function updateProduct($config, $data, $id){
		$url = "https://merchant-api.ifood.com.br/catalog/v1.0/merchants/".$config->merchantUUID."/products/$id";
		$headers = [
			"Authorization: Bearer " . $config->accessToken,
			'Content-Type: application/json'
		];
		$payload = json_encode($data);

		$result = $this->makeApiRequest($url, $headers, 'PUT', $payload);

		return json_decode($result['response']);
	}

	public function updateStatusProduct($config, $data, $id){
		$url = "https://merchant-api.ifood.com.br/catalog/v1.0/merchants/".$config->merchantUUID."/items/$id/status";
		$headers = [
			"Authorization: Bearer " . $config->accessToken,
			'Content-Type: application/json'
		];
		$payload = json_encode($data);

		$result = $this->makeApiRequest($url, $headers, 'PATCH', $payload);
		return $result;
	}

	public function destroyProduct($config, $id){
		$url = "https://merchant-api.ifood.com.br/catalog/v1.0/merchants/".$config->merchantUUID."/products/".$id;

		$headers = [
			'Authorization: Bearer ' . $config->accessToken,
			'Accept: application/json'
		];

		$result = $this->makeApiRequest($url, $headers, 'DELETE');

		if ($result['http_code'] === 200) {
			return json_decode($result['response'], true);
		}
		return null;

	}

	public function addStockProduct($config, $data){
		$url = "https://merchant-api.ifood.com.br/catalog/v1.0/merchants/".$config->merchantUUID."/inventory";

		$ch = curl_init();
		$headers = [
			"Authorization: Bearer " . $config->accessToken,
			'Content-Type: application/json'
		];
		$payload = json_encode($data);
		$result = $this->makeApiRequest($url, $headers, 'POST', $payload);

		return json_decode($result['response']);
	}

	public function associationProductCategory($config, $categoryId, $productId, $data){
		$url = "https://merchant-api.ifood.com.br/catalog/v1.0/merchants/".$config->merchantUUID."/categories/$categoryId/products/$productId";
		$headers = [
			"Authorization: Bearer " . $config->accessToken,
			'Content-Type: application/json'
		];
		$payload = json_encode($data);

		$result = $this->makeApiRequest($url, $headers, 'POST', $payload);
		return json_decode($result['response']);
	}

	public function getStock($config, $id){
		$url = "https://merchant-api.ifood.com.br/catalog/v1.0/merchants/".$config->merchantUUID."/inventory/$id";
		$headers = [
			'Authorization: Bearer ' . $config->accessToken,
			'Accept: application/json'
		];

		$result = $this->makeApiRequest($url, $headers);

		if ($result['http_code'] === 200) {
			return json_decode($result['response'], true);
		}
		return null;

	}

	public function getOrders($config, $types){
		$url = "https://merchant-api.ifood.com.br/order/v1.0/events:polling?types=$types&groups=ORDER_STATUS%2CDELIVERY";

		$headers = [
			"Authorization: Bearer " . $config->accessToken,
			"x-polling-merchants: " . $config->merchantUUID
		];

		$result = $this->makeApiRequest($url, $headers);
		return json_decode($result['response']);
	}

	public function getOrderDetail($config, $id){
		$url = "https://merchant-api.ifood.com.br/order/v1.0/orders/$id";
		$headers = [
			"Authorization: Bearer " . $config->accessToken,
		];

		$result = $this->makeApiRequest($url, $headers);
		if ($result['http_code'] === 200) {
			return json_decode($result['response'], true);
		}
		return $result;
	}


}