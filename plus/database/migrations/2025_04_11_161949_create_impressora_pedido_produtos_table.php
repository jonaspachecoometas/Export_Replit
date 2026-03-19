<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('impressora_pedido_produtos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('impressora_id')->constrained('impressora_pedidos');
            $table->foreignId('produto_id')->constrained('produtos');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('impressora_pedido_produtos');
    }
};
