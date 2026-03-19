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
        Schema::create('categoria_adicionals', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')->constrained('empresas');
            $table->string('nome', 50);
            $table->integer('minimo_escolha')->default(0);
            $table->integer('maximo_escolha')->default(0);
            $table->boolean('status')->default(1);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categoria_adicionals');
    }
};
