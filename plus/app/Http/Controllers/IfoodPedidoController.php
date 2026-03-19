<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Utils\IfoodUtil;
use App\Models\IfoodConfig;
use App\Models\PedidoIfood;
use App\Models\ItemPedidoIfood;
use App\Models\EntregaPedidoIfood;
use App\Models\PagamentoPedidoIfood;
use App\Models\AdicionalItemPedidoIfood;

class IfoodPedidoController extends Controller
{
    protected $util;

    public function __construct(IfoodUtil $util)
    {
        $this->util = $util;
    }

    public function index(Request $request){
        $config = IfoodConfig::
        where('empresa_id', $request->empresa_id)
        ->first();

        $result = $this->util->getOrders($config, "PLC");
        if($result != null){
            foreach($result as $item){
                $pedido = $this->util->getOrderDetail($config, $item->orderId);
                // dd($pedido);
                $this->cadastrarPedido($pedido);
            }
        }

        $data = PedidoIfood::where('empresa_id', $request->empresa_id)
        ->paginate(__itensPagina());

        return view('ifood_pedidos.index', compact('data'));
    }

    private function cadastrarPedido($pedido){
        $item = PedidoIfood::where('ifood_id', $pedido['id'])->first();
        if($item == null){

            $customer = $pedido['customer'];
            $total = $pedido['total'];

            $item = PedidoIfood::create([
                'empresa_id' => request()->empresa_id,
                'cliente_nome' => $customer ? $customer['name'] : '',
                'cliente_documento' => $customer ? $customer['documentNumber'] : '',
                'ifood_id' => $pedido['id'],
                'tipo_pedido' => $pedido['orderType'],
                'id_exibicao' => $pedido['displayId'],
                'data_pedido' => $pedido['createdAt'],
                'valor_produtos' => $total['subTotal'],
                'valor_entrega' => $total['deliveryFee'],
                'valor_adicional' => $total['additionalFees'],
                'total' => $total['orderAmount'],
                'informacao_adicional' => ''
            ]);

            $delivery = $pedido['delivery'] ?? [];
            $address  = $delivery['deliveryAddress'] ?? [];
            $coords   = $address['coordinates'] ?? [];

            EntregaPedidoIfood::create([
                'pedido_id' => $item->id,
                'descricao' => $delivery['description'] ?? null,
                'rua' => $address['streetName'] ?? null,
                'numero' => $address['streetNumber'] ?? null,
                'bairro' => $address['neighborhood'] ?? null,
                'complemento' => $address['complement'] ?? null,
                'referencia' => $address['reference'] ?? null,
                'cidade' => $address['city'] ?? null,
                'uf' => $address['state'] ?? null,
                'cep' => $address['postalCode'] ?? null,
                'latitude' => $coords['latitude'] ?? null,
                'longitude' => $coords['longitude'] ?? null,
                'observacao' => $delivery['observations'] ?? null,
            ]);

            $payments = $pedido['payments']['methods'] ?? [];
            foreach ($payments as $pay) {

                $transaction = $pay['transaction'] ?? [];
                $card = $transaction['card'] ?? [];

                PagamentoPedidoIfood::create([
                    'pedido_id' => $item->id,
                    'valor' => $pay['value'] ?? 0,
                    'tipo_pagamento' => $pay['method'] ?? null,
                    'pre_pago' => $pay['prepaid'] ?? false,
                    'codigo_autorizacao' => $card['authorizationCode'] ?? null,
                    'bandeira_cartao' => $card['brand'] ?? null,
                ]);
            }

            foreach($pedido['items'] as $i){
                $itemPedido = ItemPedidoIfood::create([
                    'pedido_id' => $item->id,
                    'nome' => $i['name'],
                    'id_pedido' => $i['id'],
                    'id_unico' => $i['uniqueId'],
                    'codigo_externo' => $i['externalCode'],
                    'ean' => $i['externalCode'],
                    'unidade' => $i['unit'],
                    'quantidade' => $i['quantity'],
                    'valor_unitario' => $i['unitPrice'],
                    'valor_adicionais' => $i['optionsPrice'],
                    'valor_personalizado' => $i['customizationPrice'],
                    'sub_total' => $i['totalPrice'],
                    'observacao' => $i['observations'],
                    'imagem_url' => $i['imageUrl']
                ]);


                $options = $i['options'] ?? [];
                foreach($options as $op){
                    AdicionalItemPedidoIfood::create([
                        'item_pedido_id' => $itemPedido->id,
                        'nome' => $op['name'],
                        'tipo' => $op['type'],
                        'quantidade' => $op['quantity'],
                        'valor_unitario' => $op['unitPrice'],
                        'sub_total' => $op['price']
                    ]);
                }
            }
        }
    }

    public function show($id){
        $item = PedidoIfood::findOrFail($id);

        $config = IfoodConfig::
        where('empresa_id', $item->empresa_id)
        ->first();
        $pedido = $this->util->getOrderDetail($config, $item->ifood_id);

        // dd($pedido['items']);
        return view('ifood_pedidos.show', compact('item'));
    }
}
