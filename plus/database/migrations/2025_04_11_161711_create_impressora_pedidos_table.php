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
        Schema::create('impressora_pedidos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')->constrained('empresas');
            $table->string('descricao', 60);
            $table->boolean('status')->default(1);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('impressora_pedidos');
    }
};
